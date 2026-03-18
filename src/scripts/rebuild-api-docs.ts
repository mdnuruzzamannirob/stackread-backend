import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

import type { ZodTypeAny } from 'zod'

type ImportBinding = {
  source: string
  importName: string
}

type RouteDef = {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete'
  routePath: string
  fullPath: string
  tag: string
  auth: 'none' | 'user' | 'staff'
  permission?: string
  bodySchemaRef?: string
  querySchemaRef?: string
  paramsSchemaRef?: string
  handlerName?: string
  routerFile: string
}

type JsonSchema = Record<string, unknown>

const projectRoot = process.cwd()
const apiPrefix = '/api/v1'
const docsDir = path.join(projectRoot, 'documentation')
const openApiPath = path.join(docsDir, 'OpenAPI_v1.json')
const postmanPath = path.join(docsDir, 'Postman_Collection_v1.json')

const read = (filePath: string) => fs.readFileSync(filePath, 'utf8')

const parseSource = (filePath: string) => {
  return ts.createSourceFile(
    filePath,
    read(filePath),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
}

const stringLiteralValue = (
  node: ts.Expression | undefined,
): string | undefined => {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  return undefined
}

const getText = (
  sourceFile: ts.SourceFile,
  node: ts.Node | undefined,
): string | undefined => {
  if (!node) return undefined
  return node.getText(sourceFile).trim()
}

const normalizeSlashes = (value: string): string => value.replace(/\\/g, '/')

const joinRoutePath = (prefix: string, routePath: string): string => {
  const left = prefix === '/' ? '' : prefix
  const merged = `${left}/${routePath}`.replace(/\/+/g, '/')
  const normalized = merged.startsWith('/') ? merged : `/${merged}`
  return normalized.replace(/\/$/, '') || '/'
}

const toOpenApiPath = (fullPath: string): string => {
  return fullPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}')
}

const prettify = (value: string): string => {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase())
}

const toTag = (moduleName: string): string => moduleName

const collectImports = (
  sourceFile: ts.SourceFile,
): Record<string, ImportBinding> => {
  const map: Record<string, ImportBinding> = {}

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    if (!statement.importClause) continue

    const moduleSpecifier = stringLiteralValue(statement.moduleSpecifier)
    if (!moduleSpecifier) continue

    const bindings = statement.importClause.namedBindings

    if (statement.importClause.name) {
      map[statement.importClause.name.text] = {
        source: moduleSpecifier,
        importName: 'default',
      }
    }

    if (bindings && ts.isNamedImports(bindings)) {
      for (const el of bindings.elements) {
        const localName = el.name.text
        const importName = (el.propertyName ?? el.name).text
        map[localName] = {
          source: moduleSpecifier,
          importName,
        }
      }
    }
  }

  return map
}

const findModuleRouterFile = (moduleDir: string): string => {
  const candidates = ['router.ts', 'auth.router.ts', 'health.router.ts']
  for (const candidate of candidates) {
    const full = path.join(moduleDir, candidate)
    if (fs.existsSync(full)) return full
  }
  throw new Error(`No router file found in ${moduleDir}`)
}

const resolveImportFile = (fromFile: string, moduleSource: string): string => {
  const base = path.resolve(path.dirname(fromFile), moduleSource)
  const candidates = [
    `${base}.ts`,
    `${base}.js`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.js'),
  ]

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate
  }

  throw new Error(`Unable to resolve import '${moduleSource}' from ${fromFile}`)
}

const getPropertyInitializer = (
  sourceFile: ts.SourceFile,
  call: ts.CallExpression,
  key: 'body' | 'query' | 'params',
): string | undefined => {
  const firstArg = call.arguments[0]
  if (!firstArg || !ts.isObjectLiteralExpression(firstArg)) return undefined

  for (const prop of firstArg.properties) {
    if (!ts.isPropertyAssignment(prop)) continue
    const propName = getText(sourceFile, prop.name)
    if (propName !== key) continue
    return getText(sourceFile, prop.initializer)
  }

  return undefined
}

const extractPermission = (
  sourceFile: ts.SourceFile,
  arg: ts.Expression,
): string | undefined => {
  if (!ts.isCallExpression(arg)) return undefined
  const exprText = getText(sourceFile, arg.expression)
  if (exprText !== 'requirePermission') return undefined
  return stringLiteralValue(arg.arguments[0])
}

const extractValidationRefs = (
  sourceFile: ts.SourceFile,
  args: readonly ts.Expression[],
): { body?: string; query?: string; params?: string } => {
  for (const arg of args) {
    if (!ts.isCallExpression(arg)) continue
    const exprText = getText(sourceFile, arg.expression)
    if (exprText !== 'validateRequest') continue

    const body = getPropertyInitializer(sourceFile, arg, 'body')
    const query = getPropertyInitializer(sourceFile, arg, 'query')
    const params = getPropertyInitializer(sourceFile, arg, 'params')

    return {
      ...(body ? { body } : {}),
      ...(query ? { query } : {}),
      ...(params ? { params } : {}),
    }
  }

  return {}
}

const resolveRoutesMounts = (): Array<{
  moduleName: string
  prefix: string
  routerFile: string
}> => {
  const routesFile = path.join(projectRoot, 'src', 'app', 'routes.ts')
  const source = parseSource(routesFile)
  const imports = collectImports(source)
  const mounts: Array<{
    moduleName: string
    prefix: string
    routerFile: string
  }> = []

  const visit = (node: ts.Node) => {
    if (ts.isCallExpression(node)) {
      const expr = node.expression
      if (
        ts.isPropertyAccessExpression(expr) &&
        expr.expression.getText(source) === 'router' &&
        expr.name.text === 'use'
      ) {
        const prefix = stringLiteralValue(node.arguments[0])
        const routerArg = node.arguments[1]
        if (prefix && routerArg && ts.isIdentifier(routerArg)) {
          const binding = imports[routerArg.text]
          if (binding) {
            const importedFile = resolveImportFile(routesFile, binding.source)
            const moduleDir = path.dirname(importedFile)
            const moduleName = path.basename(moduleDir)
            const routerFile = findModuleRouterFile(moduleDir)
            mounts.push({
              moduleName,
              prefix,
              routerFile,
            })
          }
        }
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(source)
  return mounts
}

const parseRouterFileRoutes = (mount: {
  moduleName: string
  prefix: string
  routerFile: string
}): RouteDef[] => {
  const source = parseSource(mount.routerFile)
  const routes: RouteDef[] = []

  const visit = (node: ts.Node) => {
    if (!ts.isCallExpression(node)) {
      ts.forEachChild(node, visit)
      return
    }

    const expr = node.expression
    if (!ts.isPropertyAccessExpression(expr)) {
      ts.forEachChild(node, visit)
      return
    }

    if (expr.expression.getText(source) !== 'router') {
      ts.forEachChild(node, visit)
      return
    }

    const method = expr.name.text
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) {
      ts.forEachChild(node, visit)
      return
    }

    const args = node.arguments
    const routePath = stringLiteralValue(args[0])
    if (!routePath) {
      ts.forEachChild(node, visit)
      return
    }

    const argTexts = args.map((arg) => getText(source, arg) ?? '')
    const auth = argTexts.some((v) => v.includes('authenticateStaff'))
      ? 'staff'
      : argTexts.some((v) => v.includes('authenticateUser'))
        ? 'user'
        : 'none'

    let permission: string | undefined
    for (const arg of args) {
      const value = extractPermission(source, arg)
      if (value) {
        permission = value
        break
      }
    }

    const validationRefs = extractValidationRefs(source, args)

    const handlerArg = args[args.length - 1]
    const handlerName =
      handlerArg && ts.isIdentifier(handlerArg) ? handlerArg.text : undefined

    const fullModulePrefix = mount.prefix
    const fullPath = `${apiPrefix}${joinRoutePath(fullModulePrefix, routePath)}`

    const route: RouteDef = {
      method: method as RouteDef['method'],
      routePath,
      fullPath,
      tag: toTag(mount.moduleName),
      auth: auth as RouteDef['auth'],
      routerFile: normalizeSlashes(
        path.relative(projectRoot, mount.routerFile),
      ),
      ...(permission ? { permission } : {}),
      ...(validationRefs.body ? { bodySchemaRef: validationRefs.body } : {}),
      ...(validationRefs.query ? { querySchemaRef: validationRefs.query } : {}),
      ...(validationRefs.params
        ? { paramsSchemaRef: validationRefs.params }
        : {}),
      ...(handlerName ? { handlerName } : {}),
    }

    routes.push(route)

    ts.forEachChild(node, visit)
  }

  visit(source)

  // Deduplicate potential parsing overlaps.
  const uniq = new Map<string, RouteDef>()
  for (const route of routes) {
    uniq.set(`${route.method}:${route.fullPath}`, route)
  }

  return [...uniq.values()]
}

const moduleExportCache = new Map<string, any>()

const importModule = async (moduleFile: string): Promise<any> => {
  const key = normalizeSlashes(moduleFile)
  if (moduleExportCache.has(key)) return moduleExportCache.get(key)
  const imported = await import(pathToFileURL(moduleFile).href)
  moduleExportCache.set(key, imported)
  return imported
}

const resolveSchemaByRef = async (
  routerFile: string,
  schemaRef: string | undefined,
): Promise<ZodTypeAny | undefined> => {
  if (!schemaRef) return undefined

  const source = parseSource(routerFile)
  const imports = collectImports(source)
  const parts = schemaRef.split('.')
  const first = parts[0]
  if (!first) return undefined
  const binding = imports[first]
  if (!binding) return undefined

  const moduleFile = resolveImportFile(routerFile, binding.source)
  const mod = await importModule(moduleFile)
  let value: unknown = mod[binding.importName]

  for (const key of parts.slice(1)) {
    if (!value || typeof value !== 'object') return undefined
    value = (value as Record<string, unknown>)[key]
  }

  if (value && typeof value === 'object' && '_def' in (value as object)) {
    return value as ZodTypeAny
  }

  return undefined
}

const unwrapSchema = (schema: ZodTypeAny): ZodTypeAny => {
  let current: any = schema
  while (current?._def?.innerType) {
    const typeName = current?._def?.typeName
    if (
      typeName === 'ZodOptional' ||
      typeName === 'ZodNullable' ||
      typeName === 'ZodDefault' ||
      typeName === 'ZodEffects' ||
      typeName === 'ZodBranded' ||
      typeName === 'ZodCatch'
    ) {
      current = current._def.innerType
    } else {
      break
    }
  }
  return current as ZodTypeAny
}

const isInputOptional = (schema: any): boolean => {
  const typeName = schema?._def?.typeName
  return typeName === 'ZodOptional' || typeName === 'ZodDefault'
}

const zodToSchema = (schema: ZodTypeAny): JsonSchema => {
  const s: any = unwrapSchema(schema)
  const typeName = s?._def?.typeName

  switch (typeName) {
    case 'ZodString': {
      const checks = s._def.checks ?? []
      const result: JsonSchema = { type: 'string' }
      for (const check of checks) {
        if (check.kind === 'email') result.format = 'email'
        if (check.kind === 'url') result.format = 'uri'
        if (check.kind === 'min') result.minLength = check.value
        if (check.kind === 'max') result.maxLength = check.value
      }
      return result
    }
    case 'ZodNumber': {
      const checks = s._def.checks ?? []
      const result: JsonSchema = { type: 'number' }
      for (const check of checks) {
        if (check.kind === 'int') result.type = 'integer'
        if (check.kind === 'min') result.minimum = check.value
        if (check.kind === 'max') result.maximum = check.value
      }
      return result
    }
    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'ZodDate':
      return { type: 'string', format: 'date-time' }
    case 'ZodEnum':
      return { type: 'string', enum: s._def.values }
    case 'ZodLiteral': {
      const value = s._def.value
      const valueType = typeof value
      return {
        type:
          valueType === 'string'
            ? 'string'
            : valueType === 'number'
              ? 'number'
              : valueType === 'boolean'
                ? 'boolean'
                : 'string',
        enum: [value],
      }
    }
    case 'ZodArray':
      return { type: 'array', items: zodToSchema(s._def.type) }
    case 'ZodRecord':
      return {
        type: 'object',
        additionalProperties: zodToSchema(s._def.valueType),
      }
    case 'ZodObject': {
      const shape =
        typeof s._def.shape === 'function' ? s._def.shape() : s._def.shape
      const properties: Record<string, JsonSchema> = {}
      const required: string[] = []

      for (const [key, child] of Object.entries(shape)) {
        const childSchema = child as ZodTypeAny
        properties[key] = zodToSchema(childSchema)
        if (!isInputOptional(childSchema)) {
          required.push(key)
        }
      }

      return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {}),
      }
    }
    case 'ZodUnion':
      return {
        oneOf: (s._def.options as ZodTypeAny[]).map((option) =>
          zodToSchema(option),
        ),
      }
    case 'ZodUnknown':
    case 'ZodAny':
    default:
      return {}
  }
}

const sampleFromSchema = (schema: JsonSchema): unknown => {
  if (Array.isArray(schema.enum) && schema.enum.length > 0)
    return schema.enum[0]
  if (schema.oneOf && Array.isArray(schema.oneOf) && schema.oneOf[0]) {
    return sampleFromSchema(schema.oneOf[0] as JsonSchema)
  }

  const type = schema.type as string | undefined
  if (type === 'string') {
    if (schema.format === 'email') return 'user@example.com'
    if (schema.format === 'date-time') return new Date().toISOString()
    if (schema.format === 'uri') return 'https://example.com/resource'
    return 'string'
  }
  if (type === 'integer' || type === 'number') {
    if (typeof schema.minimum === 'number') return schema.minimum
    return 1
  }
  if (type === 'boolean') return true
  if (type === 'array') {
    return [sampleFromSchema((schema.items as JsonSchema) ?? {})]
  }
  if (type === 'object') {
    const output: Record<string, unknown> = {}
    const properties =
      (schema.properties as Record<string, JsonSchema> | undefined) ?? {}
    for (const [key, value] of Object.entries(properties)) {
      output[key] = sampleFromSchema(value)
    }
    return output
  }
  return {}
}

const standardErrorResponse = (statusCode: string, description: string) => ({
  [statusCode]: {
    description,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            data: { nullable: true },
            meta: {
              type: 'object',
              additionalProperties: true,
            },
          },
          required: ['success', 'message'],
        },
      },
    },
  },
})

const responseSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: {
      type: 'object',
      additionalProperties: true,
    },
    meta: {
      type: 'object',
      additionalProperties: true,
    },
  },
  required: ['success', 'message', 'data'],
}

const buildOperation = async (route: RouteDef) => {
  const bodySchema = await resolveSchemaByRef(
    path.join(projectRoot, route.routerFile),
    route.bodySchemaRef,
  )
  const querySchema = await resolveSchemaByRef(
    path.join(projectRoot, route.routerFile),
    route.querySchemaRef,
  )
  const paramsSchema = await resolveSchemaByRef(
    path.join(projectRoot, route.routerFile),
    route.paramsSchemaRef,
  )

  const parameters: Array<Record<string, unknown>> = []

  const pushParams = (
    schema: ZodTypeAny | undefined,
    location: 'query' | 'path',
  ) => {
    if (!schema) return
    const parsed = zodToSchema(schema)
    if (parsed.type !== 'object') return
    const props =
      (parsed.properties as Record<string, JsonSchema> | undefined) ?? {}
    const required = new Set((parsed.required as string[] | undefined) ?? [])
    for (const [name, propSchema] of Object.entries(props)) {
      parameters.push({
        name,
        in: location,
        required: location === 'path' ? true : required.has(name),
        schema: propSchema,
      })
    }
  }

  pushParams(querySchema, 'query')
  pushParams(paramsSchema, 'path')

  const declaredPathParams = new Set(
    parameters
      .filter((item) => item.in === 'path')
      .map((item) => String(item.name)),
  )
  const pathParamMatches = [...route.fullPath.matchAll(/:([A-Za-z0-9_]+)/g)]
  for (const match of pathParamMatches) {
    const name = match[1]
    if (!name || declaredPathParams.has(name)) {
      continue
    }

    parameters.push({
      name,
      in: 'path',
      required: true,
      schema: {
        type: 'string',
      },
    })
  }

  const summarySource = route.handlerName
    ? prettify(route.handlerName)
    : `${route.method.toUpperCase()} ${route.fullPath}`

  const op: Record<string, unknown> = {
    tags: [route.tag],
    summary: summarySource,
    description: `Endpoint in module '${route.tag}' defined in ${route.routerFile}.`,
    operationId: `${route.tag}_${route.method}_${route.fullPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
    parameters,
    responses: {
      ...(route.method === 'post'
        ? {
            '201': {
              description: 'Created successfully.',
              content: { 'application/json': { schema: responseSchema } },
            },
          }
        : {
            '200': {
              description: 'Request successful.',
              content: { 'application/json': { schema: responseSchema } },
            },
          }),
      ...standardErrorResponse('400', 'Bad request.'),
      ...standardErrorResponse('401', 'Unauthorized.'),
      ...standardErrorResponse('403', 'Forbidden.'),
      ...standardErrorResponse('404', 'Not found.'),
      ...standardErrorResponse('500', 'Internal server error.'),
    },
  }

  if (route.auth !== 'none') {
    op.security = [{ bearerAuth: [] }]
  }

  if (bodySchema) {
    op.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: zodToSchema(bodySchema),
        },
      },
    }
  }

  return {
    op,
    bodySample: bodySchema
      ? sampleFromSchema(zodToSchema(bodySchema))
      : undefined,
  }
}

const buildDocs = async () => {
  const mounts = resolveRoutesMounts()
  const routeDefs = mounts.flatMap((mount) => parseRouterFileRoutes(mount))

  routeDefs.sort((a, b) => {
    if (a.fullPath === b.fullPath) return a.method.localeCompare(b.method)
    return a.fullPath.localeCompare(b.fullPath)
  })

  const paths: Record<string, Record<string, unknown>> = {}
  const postmanByTag = new Map<string, Array<Record<string, unknown>>>()
  const tags = [...new Set(routeDefs.map((r) => r.tag))].sort()

  for (const route of routeDefs) {
    const openPath = toOpenApiPath(route.fullPath)
    const { op, bodySample } = await buildOperation(route)

    if (!paths[openPath]) {
      paths[openPath] = {}
    }
    paths[openPath][route.method] = op

    const headers: Array<{ key: string; value: string; type?: string }> = []
    if (route.bodySchemaRef) {
      headers.push({ key: 'Content-Type', value: 'application/json' })
    }

    let auth: Record<string, unknown> | undefined
    if (route.auth === 'user') {
      auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{userToken}}', type: 'string' }],
      }
    }
    if (route.auth === 'staff') {
      auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{staffToken}}', type: 'string' }],
      }
    }

    const event: Array<{
      listen: string
      script: { type: string; exec: string[] }
    }> = []
    if (route.auth !== 'none') {
      event.push({
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            route.auth === 'staff'
              ? 'if (!pm.collectionVariables.get("staffToken")) { throw new Error("Missing staffToken collection variable."); }'
              : 'if (!pm.collectionVariables.get("userToken")) { throw new Error("Missing userToken collection variable."); }',
          ],
        },
      })
    }
    if (
      route.fullPath === `${apiPrefix}/auth/login` ||
      route.fullPath === `${apiPrefix}/auth/register`
    ) {
      event.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            'const json = pm.response.json();',
            'const token = json?.data?.tokens?.accessToken;',
            'if (token) { pm.collectionVariables.set("userToken", token); }',
          ],
        },
      })
    }
    if (
      route.fullPath === `${apiPrefix}/staff/login` ||
      route.fullPath === `${apiPrefix}/staff/2fa/verify`
    ) {
      event.push({
        listen: 'test',
        script: {
          type: 'text/javascript',
          exec: [
            'const json = pm.response.json();',
            'const token = json?.data?.tokens?.accessToken;',
            'if (token) { pm.collectionVariables.set("staffToken", token); }',
          ],
        },
      })
    }

    const requestItem: Record<string, unknown> = {
      name: `${route.method.toUpperCase()} ${route.fullPath}`,
      request: {
        method: route.method.toUpperCase(),
        header: headers,
        ...(auth ? { auth } : {}),
        url: {
          raw: `{{baseUrl}}${route.fullPath}`,
          host: ['{{baseUrl}}'],
          path: route.fullPath.split('/').filter(Boolean),
        },
      },
    }

    if (route.bodySchemaRef) {
      ;(requestItem.request as Record<string, unknown>).body = {
        mode: 'raw',
        raw: JSON.stringify(bodySample ?? {}, null, 2),
        options: {
          raw: {
            language: 'json',
          },
        },
      }
    }

    if (event.length > 0) {
      requestItem.event = event
    }

    const bucket = postmanByTag.get(route.tag) ?? []
    bucket.push(requestItem)
    postmanByTag.set(route.tag, bucket)
  }

  const openApi = {
    openapi: '3.0.3',
    info: {
      title: 'LMS Backend API',
      version: '1.0.0',
      description:
        'Comprehensive API documentation generated from router and validation source.',
    },
    servers: [{ url: '{{baseUrl}}' }],
    tags: tags.map((name) => ({
      name,
      description: `${prettify(name)} module endpoints`,
    })),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    paths,
  }

  const postman = {
    info: {
      name: 'LMS API v1',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description:
        'Comprehensive Postman collection generated from router and validation source.',
    },
    variable: [
      { key: 'baseUrl', value: 'http://localhost:5000' },
      { key: 'userToken', value: '' },
      { key: 'staffToken', value: '' },
    ],
    item: [...postmanByTag.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, items]) => ({
        name: tag,
        item: items,
      })),
  }

  fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(openApiPath, JSON.stringify(openApi, null, 2), 'utf8')
  fs.writeFileSync(postmanPath, JSON.stringify(postman, null, 2), 'utf8')

  console.log(`Generated OpenAPI paths: ${Object.keys(paths).length}`)
  console.log(`Generated Postman folders: ${postman.item.length}`)
  console.log(`OpenAPI: ${path.relative(projectRoot, openApiPath)}`)
  console.log(`Postman: ${path.relative(projectRoot, postmanPath)}`)
}

void buildDocs().catch((error) => {
  console.error(error)
  process.exit(1)
})
