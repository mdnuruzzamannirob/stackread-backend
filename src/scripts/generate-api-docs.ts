import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'
import type { ZodTypeAny } from 'zod'

import { env } from '../config/env'

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
  handlerImportName?: string
  routerFile: string
  isFileUpload?: boolean
}

type JsonSchema = Record<string, unknown>

type OpenApiParameter = {
  name: string
  in: 'query' | 'path'
  required: boolean
  schema: JsonSchema
  description?: string
  example?: unknown
}

type PostmanQueryParam = {
  key: string
  value: string
  description?: string
  disabled?: boolean
}

type HandlerMeta = {
  summary?: string
  description?: string
  deprecated?: boolean
}

const projectRoot = process.cwd()
const apiPrefix = env.apiPrefix
const docsDir = path.join(projectRoot, 'docs')
const openApiPath = path.join(docsDir, 'openAPI.json')
const postmanPath = path.join(docsDir, 'postman-collection.json')
const nowIsoExample = new Date().toISOString()
const objectIdExample = '65f19a9a6f8f4a2b3c4d5e6f'

let _program: ts.Program | undefined
let _checker: ts.TypeChecker | undefined
let _typeCheckerAvailable = false

const initTypeChecker = (): boolean => {
  if (_program && _checker) return true

  try {
    const configPath = ts.findConfigFile(
      projectRoot,
      ts.sys.fileExists,
      'tsconfig.json',
    )
    if (!configPath) return false

    const { config } = ts.readConfigFile(configPath, ts.sys.readFile)
    const { fileNames, options } = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(configPath),
    )

    _program = ts.createProgram(fileNames, {
      ...options,
      skipLibCheck: true,
      noEmit: true,
    })
    _checker = _program.getTypeChecker()
    _typeCheckerAvailable = true
    return true
  } catch {
    return false
  }
}

const read = (filePath: string) => fs.readFileSync(filePath, 'utf8')

const parseSource = (filePath: string): ts.SourceFile =>
  ts.createSourceFile(
    filePath,
    read(filePath),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )

const stringLiteralValue = (
  node: ts.Expression | undefined,
): string | undefined => {
  if (!node) return undefined
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    return node.text
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

const toOpenApiPath = (fullPath: string): string =>
  fullPath.replace(/:([A-Za-z0-9_]+)/g, '{$1}')

const prettify = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (ch) => ch.toUpperCase())

const collectImports = (
  sourceFile: ts.SourceFile,
): Record<string, ImportBinding> => {
  const map: Record<string, ImportBinding> = {}

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !statement.importClause) continue
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
        map[el.name.text] = {
          source: moduleSpecifier,
          importName: (el.propertyName ?? el.name).text,
        }
      }
    }
  }

  return map
}

const resolveImportFile = (
  fromFile: string,
  moduleSource: string,
): string | undefined => {
  if (moduleSource.startsWith('@') || !moduleSource.startsWith('.'))
    return undefined

  const base = path.resolve(path.dirname(fromFile), moduleSource)
  for (const candidate of [
    `${base}.ts`,
    `${base}.js`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.js'),
  ]) {
    if (fs.existsSync(candidate)) return candidate
  }

  return undefined
}

const findModuleRouterFile = (moduleDir: string): string => {
  const exact = path.join(moduleDir, 'router.ts')
  if (fs.existsSync(exact)) return exact

  const files = fs.readdirSync(moduleDir)
  const routerFile = files.find((file) => file.endsWith('.router.ts'))
  if (routerFile) return path.join(moduleDir, routerFile)

  throw new Error(`No router file found in ${moduleDir}`)
}

const extractPermission = (
  sourceFile: ts.SourceFile,
  arg: ts.Expression,
): string | undefined => {
  if (!ts.isCallExpression(arg)) return undefined
  if (getText(sourceFile, arg.expression) !== 'requirePermission')
    return undefined
  return stringLiteralValue(arg.arguments[0])
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
    if (getText(sourceFile, prop.name) !== key) continue
    return getText(sourceFile, prop.initializer)
  }

  return undefined
}

const extractValidationRefs = (
  sourceFile: ts.SourceFile,
  args: readonly ts.Expression[],
): { body?: string; query?: string; params?: string } => {
  for (const arg of args) {
    if (!ts.isCallExpression(arg)) continue
    if (getText(sourceFile, arg.expression) !== 'validateRequest') continue

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

const detectFileUpload = (
  sourceFile: ts.SourceFile,
  args: readonly ts.Expression[],
): boolean =>
  args.some((arg) => {
    const text = getText(sourceFile, arg) ?? ''
    return (
      text.includes('upload') ||
      text.includes('multer') ||
      text.includes('multipart') ||
      text.includes('.single(') ||
      text.includes('.array(') ||
      text.includes('.fields(') ||
      text.includes('fileUpload')
    )
  })

const extractHandlerRef = (
  handlerArg: ts.Expression | undefined,
): { handlerImportName: string; handlerName: string } | undefined => {
  if (!handlerArg) return undefined

  if (ts.isIdentifier(handlerArg)) {
    return { handlerImportName: handlerArg.text, handlerName: handlerArg.text }
  }

  if (
    ts.isPropertyAccessExpression(handlerArg) &&
    ts.isIdentifier(handlerArg.expression)
  ) {
    return {
      handlerImportName: handlerArg.expression.text,
      handlerName: handlerArg.name.text,
    }
  }

  return undefined
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
            if (importedFile) {
              const moduleDir = path.dirname(importedFile)
              const moduleName = path.basename(moduleDir)
              const routerFile = findModuleRouterFile(moduleDir)
              mounts.push({ moduleName, prefix, routerFile })
            }
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
    const auth = argTexts.some(
      (value) =>
        value.includes('authenticateStaff') ||
        value.includes('authenticateTempToken'),
    )
      ? 'staff'
      : argTexts.some((value) => value.includes('authenticateUser'))
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
    const isFileUpload = detectFileUpload(source, args)

    const handlerArg = args[args.length - 1]
    const handlerRef = extractHandlerRef(handlerArg)

    const fullPath = `${apiPrefix}${joinRoutePath(mount.prefix, routePath)}`

    routes.push({
      method: method as RouteDef['method'],
      routePath,
      fullPath,
      tag: mount.moduleName,
      auth: auth as RouteDef['auth'],
      routerFile: normalizeSlashes(
        path.relative(projectRoot, mount.routerFile),
      ),
      isFileUpload,
      ...(permission ? { permission } : {}),
      ...(validationRefs.body ? { bodySchemaRef: validationRefs.body } : {}),
      ...(validationRefs.query ? { querySchemaRef: validationRefs.query } : {}),
      ...(validationRefs.params
        ? { paramsSchemaRef: validationRefs.params }
        : {}),
      ...(handlerRef?.handlerName
        ? { handlerName: handlerRef.handlerName }
        : {}),
      ...(handlerRef?.handlerImportName
        ? { handlerImportName: handlerRef.handlerImportName }
        : {}),
    })

    ts.forEachChild(node, visit)
  }

  visit(source)

  const uniq = new Map<string, RouteDef>()
  for (const route of routes)
    uniq.set(`${route.method}:${route.fullPath}`, route)
  return [...uniq.values()]
}

const handlerFileCache = new Map<string, string | undefined>()

const findHandlerFile = (
  routerFile: string,
  handlerImportName: string | undefined,
): string | undefined => {
  if (!handlerImportName) return undefined

  const key = `${routerFile}:${handlerImportName}`
  if (handlerFileCache.has(key)) return handlerFileCache.get(key)

  const routerAbsolute = path.join(projectRoot, routerFile)
  const source = parseSource(routerAbsolute)
  const imports = collectImports(source)

  const binding = imports[handlerImportName]
  if (!binding) {
    handlerFileCache.set(key, undefined)
    return undefined
  }

  const resolved = resolveImportFile(routerAbsolute, binding.source)
  handlerFileCache.set(key, resolved)
  return resolved
}

const extractHandlerJSDoc = (
  handlerFile: string,
  handlerName: string,
): HandlerMeta => {
  const source = parseSource(handlerFile)
  let result: HandlerMeta = {}

  const fromJSDoc = (node: ts.Node): HandlerMeta => {
    const jsDocComments = (node as any).jsDoc as ts.JSDoc[] | undefined
    if (!jsDocComments?.length) return {}
    const jsDoc = jsDocComments[jsDocComments.length - 1]
    if (!jsDoc) return {}
    const raw =
      typeof jsDoc.comment === 'string'
        ? jsDoc.comment
        : (jsDoc.comment?.map((comment: any) => comment.text ?? '').join('') ??
          '')
    const lines = raw
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean)
    const summary = lines[0]
    const description = lines.slice(1).join(' ').trim()
    const deprecated = (jsDoc.tags ?? []).some(
      (tag: ts.JSDocTag) => tag.tagName.text === 'deprecated',
    )

    return {
      ...(summary ? { summary } : {}),
      ...(description ? { description } : {}),
      ...(deprecated ? { deprecated: true } : {}),
    }
  }

  const visit = (node: ts.Node) => {
    if (ts.isFunctionDeclaration(node) && node.name?.text === handlerName) {
      result = fromJSDoc(node)
      return
    }

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === handlerName) {
          result = fromJSDoc(node)
          return
        }
      }
    }

    if (
      ts.isMethodDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === handlerName
    ) {
      result = fromJSDoc(node)
      return
    }

    ts.forEachChild(node, visit)
  }

  visit(source)
  return result
}

const typeToJsonSchema = (
  type: ts.Type,
  checker: ts.TypeChecker,
  depth = 0,
): JsonSchema => {
  if (depth > 8) return {}

  if (type.isUnion()) {
    const meaningful = type.types.filter(
      (candidate) =>
        !(candidate.flags & ts.TypeFlags.Null) &&
        !(candidate.flags & ts.TypeFlags.Undefined) &&
        !(candidate.flags & ts.TypeFlags.Never),
    )

    if (meaningful.length === 1 && meaningful[0])
      return typeToJsonSchema(meaningful[0], checker, depth)
    if (meaningful.every((candidate) => candidate.isStringLiteral())) {
      return {
        type: 'string',
        enum: meaningful.map(
          (candidate) => (candidate as ts.StringLiteralType).value,
        ),
      }
    }
    if (meaningful.every((candidate) => candidate.isNumberLiteral())) {
      return {
        type: 'number',
        enum: meaningful.map(
          (candidate) => (candidate as ts.NumberLiteralType).value,
        ),
      }
    }
    return {
      oneOf: meaningful.map((candidate) =>
        typeToJsonSchema(candidate, checker, depth + 1),
      ),
    }
  }

  if (type.isStringLiteral()) return { type: 'string', enum: [type.value] }
  if (type.isNumberLiteral()) return { type: 'number', enum: [type.value] }

  if (type.flags & ts.TypeFlags.String) return { type: 'string' }
  if (type.flags & ts.TypeFlags.Number) return { type: 'number' }
  if (type.flags & ts.TypeFlags.BigInt)
    return { type: 'integer', format: 'int64' }
  if (
    type.flags & ts.TypeFlags.Boolean ||
    type.flags & ts.TypeFlags.BooleanLiteral
  )
    return { type: 'boolean' }
  if (type.flags & ts.TypeFlags.Null || type.flags & ts.TypeFlags.Undefined)
    return { nullable: true }
  if (type.flags & ts.TypeFlags.Any || type.flags & ts.TypeFlags.Unknown)
    return {}

  if (checker.isArrayType(type)) {
    const args = (type as ts.TypeReference).typeArguments
    return {
      type: 'array',
      items: args?.[0] ? typeToJsonSchema(args[0], checker, depth + 1) : {},
    }
  }

  const symbol = type.getSymbol()
  if (symbol?.getName() === 'Promise') {
    const args = (type as ts.TypeReference).typeArguments
    if (args?.[0]) return typeToJsonSchema(args[0], checker, depth)
  }

  if (type.flags & ts.TypeFlags.Object) {
    const props = checker.getPropertiesOfType(type)
    if (!props.length) return {}

    const properties: Record<string, JsonSchema> = {}
    const required: string[] = []

    for (const prop of props) {
      if (prop.flags & ts.SymbolFlags.Method) continue
      if (prop.name.startsWith('_')) continue

      const declaration = prop.valueDeclaration ?? prop.declarations?.[0]
      const propType = checker.getTypeOfSymbolAtLocation(
        prop,
        declaration ?? ({} as ts.Node),
      )
      const isOptional = !!(prop.flags & ts.SymbolFlags.Optional)
      properties[prop.name] = typeToJsonSchema(propType, checker, depth + 1)
      if (!isOptional) required.push(prop.name)
    }

    if (!Object.keys(properties).length) return {}
    return {
      type: 'object',
      properties,
      ...(required.length ? { required } : {}),
    }
  }

  return {}
}

const RESPONSE_HELPERS = new Set([
  'sendResponse',
  'sendSuccess',
  'successResponse',
  'sendResponseJson',
  'sendData',
  'jsonSuccess',
  'ok',
  'created',
  'respond',
])

const responseSchemaCache = new Map<string, JsonSchema | undefined>()

const extractResponseSchema = (
  handlerFile: string,
  handlerName: string,
): JsonSchema | undefined => {
  if (!_typeCheckerAvailable || !_program || !_checker) return undefined

  const key = `${handlerFile}:${handlerName}`
  if (responseSchemaCache.has(key)) return responseSchemaCache.get(key)

  try {
    const sourceFile = _program.getSourceFile(handlerFile)
    if (!sourceFile) {
      responseSchemaCache.set(key, undefined)
      return undefined
    }

    let schema: JsonSchema | undefined
    const checker = _checker

    const isTargetHandler = (node: ts.Node): boolean => {
      if (ts.isFunctionDeclaration(node) && node.name?.text === handlerName)
        return true
      if (ts.isVariableStatement(node)) {
        return node.declarationList.declarations.some(
          (decl) =>
            ts.isIdentifier(decl.name) && decl.name.text === handlerName,
        )
      }
      if (
        ts.isMethodDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === handlerName
      ) {
        return true
      }
      return false
    }

    const extractDataSchema = (
      dataArg: ts.Expression,
    ): JsonSchema | undefined => {
      if (ts.isObjectLiteralExpression(dataArg)) {
        const dataProp = dataArg.properties.find((prop) => {
          if (
            !ts.isPropertyAssignment(prop) &&
            !ts.isShorthandPropertyAssignment(prop)
          )
            return false
          return getText(sourceFile, prop.name) === 'data'
        })

        if (dataProp) {
          const initializer = ts.isPropertyAssignment(dataProp)
            ? dataProp.initializer
            : dataProp.name
          if (initializer) {
            const propType = checker.getTypeAtLocation(initializer)
            const propSchema = typeToJsonSchema(propType, checker)
            if (Object.keys(propSchema).length) return propSchema
          }
        }
      }

      const inferredType = checker.getTypeAtLocation(dataArg)
      const inferredSchema = typeToJsonSchema(inferredType, checker)
      return Object.keys(inferredSchema).length ? inferredSchema : undefined
    }

    const scanBody = (node: ts.Node) => {
      if (schema) return

      if (ts.isCallExpression(node)) {
        const calleeText = node.expression.getText(sourceFile)
        const isHelper = [...RESPONSE_HELPERS].some(
          (helperName) =>
            calleeText === helperName || calleeText.endsWith(`.${helperName}`),
        )

        if (isHelper) {
          const helperName = calleeText.split('.').pop()

          if (helperName === 'sendResponse') {
            const payloadArg = node.arguments[1]
            if (payloadArg) {
              const schemaFromPayload = extractDataSchema(payloadArg)
              if (schemaFromPayload) {
                schema = schemaFromPayload
                return
              }
            }
          }

          const typeArgs = node.typeArguments
          if (typeArgs?.[0]) {
            const typeSchema = typeToJsonSchema(
              checker.getTypeAtLocation(typeArgs[0]),
              checker,
            )
            if (Object.keys(typeSchema).length) {
              schema = typeSchema
              return
            }
          }

          const dataArg = node.arguments[1]
          if (dataArg) {
            const dataSchema = extractDataSchema(dataArg)
            if (dataSchema) {
              schema = dataSchema
              return
            }
          }
        }

        if (
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'json'
        ) {
          const arg = node.arguments[0]
          if (arg) {
            const responseSchema = typeToJsonSchema(
              checker.getTypeAtLocation(arg),
              checker,
            )
            if (Object.keys(responseSchema).length) {
              schema = responseSchema
              return
            }
          }
        }
      }

      ts.forEachChild(node, scanBody)
    }

    const visitTop = (node: ts.Node) => {
      if (schema) return
      if (isTargetHandler(node)) {
        ts.forEachChild(node, scanBody)
        return
      }
      ts.forEachChild(node, visitTop)
    }

    visitTop(sourceFile)
    responseSchemaCache.set(key, schema)
    return schema
  } catch {
    responseSchemaCache.set(key, undefined)
    return undefined
  }
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

  const routerAbsolute = path.join(projectRoot, routerFile)
  const source = parseSource(routerAbsolute)
  const imports = collectImports(source)

  const parts = schemaRef.split('.')
  const first = parts[0]
  if (!first) return undefined
  const binding = imports[first]
  if (!binding) return undefined

  const moduleFile = resolveImportFile(routerAbsolute, binding.source)
  if (!moduleFile) return undefined

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

const unwrapZod = (schema: ZodTypeAny): ZodTypeAny => {
  const WRAPPERS = new Set([
    'ZodOptional',
    'ZodNullable',
    'ZodDefault',
    'ZodEffects',
    'ZodBranded',
    'ZodCatch',
  ])
  let current: any = schema
  while (current?._def?.innerType && WRAPPERS.has(current._def.typeName)) {
    current = current._def.innerType
  }
  return current as ZodTypeAny
}

const isZodOptional = (schema: any): boolean =>
  schema?._def?.typeName === 'ZodOptional' ||
  schema?._def?.typeName === 'ZodDefault'

const zodToSchema = (schema: ZodTypeAny): JsonSchema => {
  const s: any = unwrapZod(schema)
  const typeName = s?._def?.typeName

  switch (typeName) {
    case 'ZodString': {
      const checks = s._def.checks ?? []
      const result: JsonSchema = { type: 'string' }
      for (const check of checks) {
        if (check.kind === 'email') result.format = 'email'
        else if (check.kind === 'url') result.format = 'uri'
        else if (check.kind === 'uuid') result.format = 'uuid'
        else if (check.kind === 'cuid') result.format = 'cuid'
        else if (check.kind === 'datetime') result.format = 'date-time'
        else if (check.kind === 'ip') result.format = 'ipv4'
        else if (check.kind === 'min') result.minLength = check.value
        else if (check.kind === 'max') result.maxLength = check.value
        else if (check.kind === 'regex')
          result.pattern = (check.regex as RegExp).source
      }
      return result
    }

    case 'ZodNumber': {
      const checks = s._def.checks ?? []
      const result: JsonSchema = { type: 'number' }
      for (const check of checks) {
        if (check.kind === 'int') result.type = 'integer'
        else if (check.kind === 'min') result.minimum = check.value
        else if (check.kind === 'max') result.maximum = check.value
        else if (check.kind === 'multipleOf') result.multipleOf = check.value
      }
      return result
    }

    case 'ZodBoolean':
      return { type: 'boolean' }
    case 'ZodDate':
      return { type: 'string', format: 'date-time' }
    case 'ZodBigInt':
      return { type: 'integer', format: 'int64' }

    case 'ZodEnum':
      return { type: 'string', enum: s._def.values }

    case 'ZodNativeEnum': {
      const values = Object.values(
        s._def.values as Record<string, unknown>,
      ).filter(
        (value) => typeof value === 'string' || typeof value === 'number',
      )
      return {
        type: typeof values[0] === 'number' ? 'integer' : 'string',
        enum: values,
      }
    }

    case 'ZodLiteral': {
      const value = s._def.value
      return {
        type:
          typeof value === 'number'
            ? 'number'
            : typeof value === 'boolean'
              ? 'boolean'
              : 'string',
        enum: [value],
      }
    }

    case 'ZodArray': {
      const result: JsonSchema = {
        type: 'array',
        items: zodToSchema(s._def.type),
      }
      if (s._def.minLength?.value != null)
        result.minItems = s._def.minLength.value
      if (s._def.maxLength?.value != null)
        result.maxItems = s._def.maxLength.value
      return result
    }

    case 'ZodTuple':
      return {
        type: 'array',
        items: { oneOf: (s._def.items as ZodTypeAny[]).map(zodToSchema) },
        minItems: s._def.items.length,
        maxItems: s._def.items.length,
      }

    case 'ZodRecord':
      return {
        type: 'object',
        additionalProperties: zodToSchema(s._def.valueType),
      }

    case 'ZodMap':
      return {
        type: 'object',
        additionalProperties: zodToSchema(s._def.valueType),
      }

    case 'ZodSet':
      return {
        type: 'array',
        items: zodToSchema(s._def.valueType),
        uniqueItems: true,
      }

    case 'ZodObject': {
      const shape =
        typeof s._def.shape === 'function' ? s._def.shape() : s._def.shape
      const properties: Record<string, JsonSchema> = {}
      const required: string[] = []
      for (const [key, child] of Object.entries(shape)) {
        const childSchema = child as ZodTypeAny
        properties[key] = zodToSchema(childSchema)
        if (!isZodOptional(childSchema)) required.push(key)
      }
      return {
        type: 'object',
        properties,
        ...(required.length ? { required } : {}),
      }
    }

    case 'ZodUnion':
    case 'ZodDiscriminatedUnion':
      return { oneOf: (s._def.options as ZodTypeAny[]).map(zodToSchema) }

    case 'ZodIntersection':
      return { allOf: [zodToSchema(s._def.left), zodToSchema(s._def.right)] }

    case 'ZodUnknown':
    case 'ZodAny':
    default:
      return {}
  }
}

const generateExample = (name: string, schema: JsonSchema): unknown => {
  const lower = name.toLowerCase()

  if (schema.nullable) return null
  if (Array.isArray(schema.enum) && schema.enum.length > 0)
    return schema.enum[0]
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    return generateExample(name, (schema.oneOf as JsonSchema[])[0] ?? {})
  }

  if (lower.endsWith('email') || lower === 'email') return 'user@example.com'
  if (lower.includes('password') || lower.includes('pwd'))
    return 'SecurePass123!'
  if (lower === 'firstname' || lower.endsWith('firstname')) return 'John'
  if (lower === 'lastname' || lower.endsWith('lastname')) return 'Doe'
  if (lower === 'fullname' || lower === 'displayname') return 'John Doe'
  if (lower === 'name' || lower.endsWith('name')) return 'John Doe'
  if (
    lower.includes('phone') ||
    lower.includes('mobile') ||
    lower.includes('tel')
  )
    return '+8801712345678'
  if (lower === 'country' || lower.endsWith('country')) return 'BD'
  if (lower === 'currency') return 'BDT'
  if (lower === 'language' || lower === 'locale') return 'en'
  if (lower === 'timezone') return 'Asia/Dhaka'
  if (lower.includes('title')) return 'Sample Title'
  if (
    lower.includes('description') ||
    lower === 'bio' ||
    lower === 'summary' ||
    lower === 'about'
  ) {
    return 'Brief description here.'
  }
  if (lower.includes('url') || lower.endsWith('link') || lower === 'website')
    return 'https://example.com'
  if (
    lower.includes('avatar') ||
    lower.includes('image') ||
    lower.includes('photo') ||
    lower.includes('thumbnail')
  ) {
    return 'https://example.com/images/sample.jpg'
  }
  if (
    lower.includes('date') ||
    lower.includes('time') ||
    lower.endsWith('at') ||
    lower.endsWith('on')
  )
    return nowIsoExample
  if (
    (lower === 'id' || lower.endsWith('id')) &&
    (schema.type as string) !== 'number' &&
    (schema.type as string) !== 'integer'
  ) {
    return objectIdExample
  }
  if (lower === 'page') return 1
  if (lower === 'limit' || lower === 'pagesize' || lower === 'perpage')
    return 20
  if (lower === 'sortby' || lower === 'sort_by' || lower === 'orderby')
    return 'createdAt'
  if (lower === 'sortorder' || lower === 'sort_order' || lower === 'order')
    return 'desc'
  if (
    lower.includes('search') ||
    lower === 'q' ||
    lower === 'query' ||
    lower === 'keyword'
  )
    return 'search term'
  if (lower === 'status')
    return Array.isArray(schema.enum) ? schema.enum[0] : 'active'
  if (lower === 'role')
    return Array.isArray(schema.enum) ? schema.enum[0] : 'user'
  if (lower === 'type')
    return Array.isArray(schema.enum) ? schema.enum[0] : 'default'
  if (
    lower.includes('price') ||
    lower.includes('amount') ||
    lower.includes('cost') ||
    lower.includes('fee')
  )
    return 99.99
  if (lower.includes('quantity') || lower === 'qty' || lower === 'count')
    return 1
  if (lower === 'age') return 25
  if (lower.includes('rating') || lower.includes('score')) return 5
  if (lower === 'token' || lower.endsWith('token') || lower.endsWith('key'))
    return 'eyJhbGciOiJIUzI1NiJ9...'
  if (lower === 'otp' || lower === 'code' || lower === 'pin') return '123456'
  if (lower.includes('address') || lower === 'street') return '123 Main Street'
  if (lower.includes('city')) return 'Dhaka'
  if (
    lower.includes('state') ||
    lower.includes('province') ||
    lower.includes('district')
  )
    return 'Dhaka Division'
  if (lower.includes('zip') || lower.includes('postal')) return '1213'
  if (lower.includes('gender'))
    return Array.isArray(schema.enum) ? schema.enum[0] : 'male'

  const type = schema.type as string | undefined
  if (type === 'string') {
    if (schema.format === 'email') return 'user@example.com'
    if (schema.format === 'date-time') return nowIsoExample
    if (schema.format === 'uri') return 'https://example.com'
    if (schema.format === 'uuid') return '550e8400-e29b-41d4-a716-446655440000'
    if (schema.format === 'ipv4') return '192.168.1.1'
    if (typeof schema.minLength === 'number' && schema.minLength > 0)
      return 'a'.repeat(schema.minLength)
    return name ? prettify(name) : 'sample'
  }
  if (type === 'integer')
    return typeof schema.minimum === 'number' ? schema.minimum : 1
  if (type === 'number')
    return typeof schema.minimum === 'number' ? schema.minimum : 1.0
  if (type === 'boolean') return true
  if (type === 'array')
    return [
      generateExample(
        name.replace(/s$/, ''),
        (schema.items as JsonSchema) ?? {},
      ),
    ]
  if (type === 'object') {
    const result: Record<string, unknown> = {}
    const properties =
      (schema.properties as Record<string, JsonSchema> | undefined) ?? {}
    for (const [key, value] of Object.entries(properties))
      result[key] = generateExample(key, value)
    return result
  }

  return undefined
}

const buildExampleFromSchema = (schema: JsonSchema): unknown => {
  if (schema.nullable) return null
  if (schema.type === 'object' || schema.properties) {
    const result: Record<string, unknown> = {}
    const props =
      (schema.properties as Record<string, JsonSchema> | undefined) ?? {}
    for (const [key, value] of Object.entries(props))
      result[key] = generateExample(key, value)
    return result
  }
  if (schema.type === 'array') {
    return [buildExampleFromSchema((schema.items as JsonSchema) ?? {})]
  }
  return generateExample('', schema)
}

const parameterDescription = (
  name: string,
  schema: JsonSchema,
  location: 'query' | 'path',
): string => {
  const lower = name.toLowerCase()
  if (location === 'path') {
    const resource = prettify(name.replace(/Id$/i, ''))
    return `Unique identifier of ${resource}.`
  }
  if (lower === 'page') return 'Page number (starts at 1).'
  if (lower === 'limit' || lower === 'pagesize')
    return 'Number of records per page.'
  if (lower === 'sortby' || lower === 'sort_by') return 'Field to sort by.'
  if (lower === 'sortorder' || lower === 'sort_order' || lower === 'order') {
    const allowed = Array.isArray(schema.enum)
      ? (schema.enum as string[]).join(', ')
      : 'asc, desc'
    return `Sort direction. Allowed: ${allowed}.`
  }
  if (lower.includes('search') || lower === 'q' || lower === 'keyword')
    return 'Search keyword.'
  if (Array.isArray(schema.enum) && schema.enum.length > 0) {
    return `Filter by ${prettify(name)}. Allowed values: ${(schema.enum as unknown[]).join(', ')}.`
  }
  if (lower.includes('from') || lower.startsWith('start'))
    return 'Start of date range (ISO 8601).'
  if (lower.includes('to') || lower.startsWith('end'))
    return 'End of date range (ISO 8601).'
  if (lower.includes('filter'))
    return `Filter by ${prettify(name.replace(/filter/i, '').trim())}.`
  return `Filter by ${prettify(name)}.`
}

const isListEndpoint = (
  handlerName: string | undefined,
  routePath: string,
): boolean => {
  const listPatterns = [
    /^getAll/i,
    /^listAll/i,
    /^list\b/i,
    /^findAll/i,
    /^fetchAll/i,
    /^search\b/i,
    /^getList/i,
    /^getMany/i,
    /^browseAll/i,
    /^getAllBy/i,
    /List$/,
    /All$/,
    /s\b/,
  ]

  if (handlerName && listPatterns.some((pattern) => pattern.test(handlerName)))
    return true

  const lastSegment = routePath.split('/').filter(Boolean).pop() ?? ''
  if (!lastSegment.startsWith(':') && !lastSegment.startsWith('{')) {
    if (/[^s]s$/.test(lastSegment)) return true
  }

  return false
}

const DEFAULT_PAGINATION_PARAMS: OpenApiParameter[] = [
  {
    name: 'page',
    in: 'query',
    required: false,
    description: 'Page number (starts at 1).',
    schema: { type: 'integer', minimum: 1 },
    example: 1,
  },
  {
    name: 'limit',
    in: 'query',
    required: false,
    description: 'Number of records per page.',
    schema: { type: 'integer', minimum: 1, maximum: 100 },
    example: 20,
  },
  {
    name: 'search',
    in: 'query',
    required: false,
    description: 'Search keyword.',
    schema: { type: 'string' },
    example: 'keyword',
  },
  {
    name: 'sortBy',
    in: 'query',
    required: false,
    description: 'Field to sort by.',
    schema: { type: 'string' },
    example: 'createdAt',
  },
  {
    name: 'sortOrder',
    in: 'query',
    required: false,
    description: 'Sort direction. Allowed: asc, desc.',
    schema: { type: 'string', enum: ['asc', 'desc'] },
    example: 'desc',
  },
]

const buildErrorSchema = () => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: false },
    message: { type: 'string' },
    code: { type: 'string' },
    errors: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    data: { nullable: true },
  },
  required: ['success', 'message'],
})

const buildSuccessSchema = (_route: RouteDef, responseData?: JsonSchema) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: responseData ?? { type: 'object', additionalProperties: true },
    meta: { type: 'object', additionalProperties: true },
  },
  required: ['success', 'message', 'data'],
})

const ERROR_MESSAGES: Record<string, string> = {
  '400': 'Validation error.',
  '401': 'Unauthorized.',
  '403': 'Forbidden.',
  '404': 'Resource not found.',
  '409': 'Conflict - resource already exists.',
  '422': 'Unprocessable entity.',
  '429': 'Too many requests.',
  '500': 'Internal server error.',
}

const ERROR_CODES: Record<string, string> = {
  '400': 'BAD_REQUEST',
  '401': 'UNAUTHORIZED',
  '403': 'FORBIDDEN',
  '404': 'NOT_FOUND',
  '409': 'CONFLICT',
  '422': 'UNPROCESSABLE_ENTITY',
  '429': 'TOO_MANY_REQUESTS',
  '500': 'INTERNAL_SERVER_ERROR',
}

const standardErrorResponse = (statusCode: string) => ({
  [statusCode]: {
    description: ERROR_MESSAGES[statusCode] ?? 'Error.',
    content: {
      'application/json': {
        schema: buildErrorSchema(),
        example: {
          success: false,
          message: ERROR_MESSAGES[statusCode] ?? 'Error.',
          code: ERROR_CODES[statusCode] ?? 'ERROR',
          data: null,
        },
      },
    },
  },
})

const getErrorCodes = (route: RouteDef): string[] => {
  const codes = ['400', '429', '500']
  if (route.auth !== 'none') codes.push('401', '403')
  if (['get', 'put', 'patch', 'delete'].includes(route.method))
    codes.push('404')
  if (route.method === 'post') codes.push('409')
  return codes
}

const buildOperation = async (route: RouteDef) => {
  const [bodyZod, queryZod, paramsZod] = await Promise.all([
    resolveSchemaByRef(route.routerFile, route.bodySchemaRef),
    resolveSchemaByRef(route.routerFile, route.querySchemaRef),
    resolveSchemaByRef(route.routerFile, route.paramsSchemaRef),
  ])

  let handlerMeta: HandlerMeta = {}
  let responseDataSchema: JsonSchema | undefined

  if (route.handlerName) {
    const handlerFile = findHandlerFile(
      route.routerFile,
      route.handlerImportName ?? route.handlerName,
    )
    if (handlerFile) {
      handlerMeta = extractHandlerJSDoc(handlerFile, route.handlerName)
      responseDataSchema = extractResponseSchema(handlerFile, route.handlerName)
    }
  }

  const parameters: OpenApiParameter[] = []

  const pushFromZod = (
    zod: ZodTypeAny | undefined,
    location: 'query' | 'path',
  ) => {
    if (!zod) return
    const parsed = zodToSchema(zod)
    if (parsed.type !== 'object') return
    const props =
      (parsed.properties as Record<string, JsonSchema> | undefined) ?? {}
    const requiredSet = new Set((parsed.required as string[] | undefined) ?? [])

    for (const [name, propSchema] of Object.entries(props)) {
      parameters.push({
        name,
        in: location,
        required: location === 'path' ? true : requiredSet.has(name),
        schema: propSchema,
        description: parameterDescription(name, propSchema, location),
        example: generateExample(name, propSchema),
      })
    }
  }

  pushFromZod(queryZod, 'query')
  pushFromZod(paramsZod, 'path')

  if (
    route.method === 'get' &&
    !route.querySchemaRef &&
    isListEndpoint(route.handlerName, route.routePath)
  ) {
    const existing = new Set(
      parameters
        .filter((parameter) => parameter.in === 'query')
        .map((parameter) => parameter.name),
    )
    for (const fallbackQuery of DEFAULT_PAGINATION_PARAMS) {
      if (!existing.has(fallbackQuery.name)) parameters.push(fallbackQuery)
    }
  }

  const declaredPath = new Set(
    parameters
      .filter((parameter) => parameter.in === 'path')
      .map((parameter) => parameter.name),
  )
  for (const match of route.fullPath.matchAll(/:([A-Za-z0-9_]+)/g)) {
    const name = match[1]
    if (!name || declaredPath.has(name)) continue
    const schema: JsonSchema = { type: 'string' }
    parameters.push({
      name,
      in: 'path',
      required: true,
      description: parameterDescription(name, schema, 'path'),
      example: generateExample(name, schema) ?? objectIdExample,
      schema,
    })
  }

  const summary =
    handlerMeta.summary ||
    prettify(
      route.handlerName ?? `${route.method.toUpperCase()} ${route.fullPath}`,
    )
  const description =
    handlerMeta.description ||
    `${route.method.toUpperCase()} ${toOpenApiPath(route.fullPath)}`
  const successCode =
    route.method === 'post' ? '201' : route.method === 'delete' ? '204' : '200'
  const successSchema = buildSuccessSchema(route, responseDataSchema)

  const successExample = {
    success: true,
    message:
      route.method === 'post'
        ? 'Created successfully.'
        : route.method === 'delete'
          ? 'Deleted successfully.'
          : 'Request successful.',
    data: responseDataSchema ? buildExampleFromSchema(responseDataSchema) : {},
    meta: {},
  }

  const op: Record<string, unknown> = {
    tags: [route.tag],
    summary,
    description,
    operationId: `${route.tag}_${route.method}_${route.fullPath.replace(/[^a-zA-Z0-9]/g, '_')}`,
    ...(handlerMeta.deprecated ? { deprecated: true } : {}),
    parameters,
    responses: {
      [successCode]: {
        description: successExample.message,
        content: {
          'application/json': {
            schema: successSchema,
            example: successExample,
          },
        },
      },
      ...getErrorCodes(route).reduce(
        (accumulator, code) => ({
          ...accumulator,
          ...standardErrorResponse(code),
        }),
        {},
      ),
    },
  }

  if (route.auth !== 'none') {
    op.security =
      route.auth === 'staff'
        ? [{ bearerStaffAuth: [] }]
        : [{ bearerUserAuth: [] }]
  }

  let bodySample: unknown
  if (route.isFileUpload) {
    op.requestBody = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: bodyZod ? zodToSchema(bodyZod) : { type: 'object' },
        },
      },
    }
  } else if (bodyZod) {
    const bodyJsonSchema = zodToSchema(bodyZod)
    bodySample = buildExampleFromSchema(bodyJsonSchema)
    op.requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: bodyJsonSchema,
          example: bodySample,
        },
      },
    }
  }

  return {
    op,
    bodySample,
    queryParameters: parameters.filter((parameter) => parameter.in === 'query'),
  }
}

const collectKnownIdVars = (routes: RouteDef[]): Set<string> => {
  const vars = new Set<string>()
  for (const route of routes) {
    for (const match of route.fullPath.matchAll(/:([A-Za-z0-9_]+)/g)) {
      if (match[1]) vars.add(match[1])
    }
  }
  return vars
}

const pmPathWithVars = (fullPath: string, knownVars: Set<string>): string =>
  fullPath.replace(/:([A-Za-z0-9_]+)/g, (_match, name: string) =>
    knownVars.has(name) ? `{{${name}}}` : `:${name}`,
  )

const toPostmanQuery = (params: OpenApiParameter[]): PostmanQueryParam[] =>
  params
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => ({
      key: parameter.name,
      value:
        parameter.example == null
          ? ''
          : typeof parameter.example === 'object'
            ? JSON.stringify(parameter.example)
            : String(parameter.example),
      disabled: !parameter.required,
      ...(parameter.description ? { description: parameter.description } : {}),
    }))

const withQS = (rawPath: string, query: PostmanQueryParam[]): string => {
  if (!query.length) return rawPath
  const qs = query
    .map((item) => `${item.key}=${encodeURIComponent(item.value)}`)
    .join('&')
  return `${rawPath}?${qs}`
}

const buildTestScripts = (route: RouteDef) => {
  const events: Array<{
    listen: string
    script: { type: string; exec: string[] }
  }> = []
  const lowerPath = route.fullPath.toLowerCase()

  if (route.auth !== 'none') {
    events.push({
      listen: 'prerequest',
      script: {
        type: 'text/javascript',
        exec: [
          route.auth === 'staff'
            ? 'if (!pm.collectionVariables.get("staffToken")) throw new Error("staffToken not set.");'
            : 'if (!pm.collectionVariables.get("userToken")) throw new Error("userToken not set.");',
        ],
      },
    })
  }

  const isLogin = lowerPath.endsWith('/login') || lowerPath.endsWith('/signin')
  const isRegister =
    lowerPath.endsWith('/register') || lowerPath.endsWith('/signup')
  const isStaff = lowerPath.includes('/staff/')
  const is2fa =
    lowerPath.endsWith('/2fa/verify') || lowerPath.endsWith('/2fa/enable')

  if ((isLogin || isRegister) && !isStaff) {
    events.push({
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'const json = pm.response.json();',
          'const token = json?.data?.accessToken ?? json?.data?.tokens?.accessToken ?? json?.data?.token;',
          'if (token) pm.collectionVariables.set("userToken", token);',
        ],
      },
    })
  }

  if (isStaff && (isLogin || is2fa)) {
    events.push({
      listen: 'test',
      script: {
        type: 'text/javascript',
        exec: [
          'const json = pm.response.json();',
          'const token = json?.data?.accessToken ?? json?.data?.tokens?.accessToken ?? json?.data?.token;',
          'if (token) pm.collectionVariables.set("staffToken", token);',
        ],
      },
    })
  }

  return events
}

const buildDocs = async () => {
  console.log('Resolving route mounts...')
  const mounts = resolveRoutesMounts()
  console.log(`Found ${mounts.length} module(s)`)

  const routeDefs = mounts.flatMap((mount) => parseRouterFileRoutes(mount))
  routeDefs.sort((a, b) =>
    a.fullPath !== b.fullPath
      ? a.fullPath.localeCompare(b.fullPath)
      : a.method.localeCompare(b.method),
  )
  console.log(`Found ${routeDefs.length} route(s)`)

  console.log('Initializing TypeScript type checker...')
  const checkerReady = initTypeChecker()
  console.log(checkerReady ? 'Type checker ready' : 'Type checker unavailable')

  const knownIdVars = collectKnownIdVars(routeDefs)
  const tags = [...new Set(routeDefs.map((route) => route.tag))].sort()
  const paths: Record<string, Record<string, unknown>> = {}
  const postmanByTag = new Map<string, Array<Record<string, unknown>>>()

  for (const route of routeDefs) {
    const openPath = toOpenApiPath(route.fullPath)
    const { op, bodySample, queryParameters } = await buildOperation(route)

    if (!paths[openPath]) paths[openPath] = {}
    paths[openPath][route.method] = op

    const headers: Array<{ key: string; value: string }> = []
    if (route.bodySchemaRef && !route.isFileUpload) {
      headers.push({ key: 'Content-Type', value: 'application/json' })
    }

    let auth: Record<string, unknown> | undefined
    if (route.auth === 'user')
      auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{userToken}}', type: 'string' }],
      }
    if (route.auth === 'staff')
      auth = {
        type: 'bearer',
        bearer: [{ key: 'token', value: '{{staffToken}}', type: 'string' }],
      }

    const pmPath = pmPathWithVars(route.fullPath, knownIdVars)
    const pmQuery =
      route.method === 'get' ? toPostmanQuery(queryParameters) : []
    const events = buildTestScripts(route)

    const requestItem: Record<string, unknown> = {
      name: `${route.method.toUpperCase()} ${route.fullPath}`,
      ...(events.length ? { event: events } : {}),
      request: {
        method: route.method.toUpperCase(),
        header: headers,
        ...(auth ? { auth } : {}),
        url: {
          raw: withQS(`{{baseUrl}}${pmPath}`, pmQuery),
          host: ['{{baseUrl}}'],
          path: pmPath.split('/').filter(Boolean),
          ...(pmQuery.length ? { query: pmQuery } : {}),
        },
        ...(route.bodySchemaRef && !route.isFileUpload
          ? {
              body: {
                mode: 'raw',
                raw: JSON.stringify(bodySample ?? {}, null, 2),
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              },
            }
          : {}),
        ...(route.isFileUpload
          ? {
              body: {
                mode: 'formdata',
                formdata: [],
              },
            }
          : {}),
      },
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
        'Auto-generated from source code - always accurate and up to date.',
    },
    servers: [{ url: '{{baseUrl}}', description: 'Application server' }],
    tags: tags.map((name) => ({
      name,
      description: `${prettify(name)} module`,
    })),
    components: {
      securitySchemes: {
        bearerUserAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token for authenticated users.',
        },
        bearerStaffAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token for staff/admin.',
        },
      },
    },
    paths,
  }

  const collectionVars = [
    { key: 'baseUrl', value: 'http://localhost:5000', type: 'string' },
    { key: 'userToken', value: '', type: 'string' },
    { key: 'staffToken', value: '', type: 'string' },
    ...[...knownIdVars].map((variable) => ({
      key: variable,
      value: objectIdExample,
      type: 'string',
    })),
  ]

  const postman = {
    info: {
      name: 'LMS API v1',
      schema:
        'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: 'Auto-generated from source code.',
    },
    variable: collectionVars,
    item: [...postmanByTag.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([tag, items]) => ({ name: tag, item: items })),
  }

  fs.mkdirSync(docsDir, { recursive: true })
  fs.writeFileSync(openApiPath, JSON.stringify(openApi, null, 2), 'utf8')
  fs.writeFileSync(postmanPath, JSON.stringify(postman, null, 2), 'utf8')

  console.log(`OpenAPI paths: ${Object.keys(paths).length}`)
  console.log(`Postman folders: ${postman.item.length}`)
  console.log(`OpenAPI: ${path.relative(projectRoot, openApiPath)}`)
  console.log(`Postman: ${path.relative(projectRoot, postmanPath)}`)
}

void buildDocs().catch((error) => {
  console.error(error)
  process.exit(1)
})
