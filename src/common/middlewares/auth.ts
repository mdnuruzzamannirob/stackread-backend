import type { RequestHandler } from 'express'

import { RoleModel } from '../../modules/rbac/model'
import { StaffModel } from '../../modules/staff/model'
import { AppError } from '../errors/AppError'
import { extractBearerToken, verifyAccessToken } from '../utils/token'

const resolveTokenFromRequest = (authorizationHeader?: string): string => {
  const token = extractBearerToken(authorizationHeader)

  if (!token) {
    throw new AppError('Unauthorized. Bearer token is required.', 401)
  }

  return token
}

export const authenticateUser: RequestHandler = (request, _response, next) => {
  try {
    const token = resolveTokenFromRequest(request.header('authorization'))
    const payload = verifyAccessToken(token, 'user')
    request.auth = payload
    next()
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Unauthorized. Invalid or expired user token.', 401),
    )
  }
}

export const authenticateStaff: RequestHandler = async (
  request,
  _response,
  next,
) => {
  try {
    const token = resolveTokenFromRequest(request.header('authorization'))
    const payload = verifyAccessToken(token, 'staff')
    const staffId = payload.id ?? payload.sub

    if (!staffId) {
      throw new AppError('Unauthorized. Invalid or expired staff token.', 401)
    }

    const staff = await StaffModel.findById(staffId)
      .select('_id email roleId isSuperAdmin isActive')
      .lean()

    if (!staff || !staff.isActive) {
      throw new AppError('Unauthorized. Invalid or expired staff token.', 401)
    }

    const role = await RoleModel.findById(staff.roleId)
      .select('name permissions')
      .lean()

    if (!role) {
      throw new AppError('Unauthorized. Invalid or expired staff token.', 401)
    }

    request.auth = {
      ...payload,
      id: staff._id.toString(),
      sub: staff._id.toString(),
      email: staff.email,
      roleId: staff.roleId.toString(),
      role: staff.isSuperAdmin ? 'super-admin' : role.name,
      permissions: staff.isSuperAdmin ? ['*'] : role.permissions,
      isSuperAdmin: staff.isSuperAdmin,
      type: 'staff',
      actorType: 'staff',
    }

    next()
  } catch (error) {
    next(
      error instanceof AppError
        ? error
        : new AppError('Unauthorized. Invalid or expired staff token.', 401),
    )
  }
}

export const optionalAuth: RequestHandler = (request, _response, next) => {
  try {
    const token = extractBearerToken(request.header('authorization'))

    if (!token) {
      next()
      return
    }

    try {
      request.auth = verifyAccessToken(token, 'user')
      next()
      return
    } catch {
      request.auth = verifyAccessToken(token, 'staff')
      next()
      return
    }
  } catch {
    next()
  }
}
