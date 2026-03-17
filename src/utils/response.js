/**
 * Standard API response helpers.
 * All responses follow the shape documented in LMS_REST_API_Design.docx.
 */

const sendSuccess = (res, data = null, message = 'OK', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, data, message })
}

const sendCreated = (res, data = null, message = 'Created') => {
  return sendSuccess(res, data, message, 201)
}

const sendPaginated = (res, data, { page, limit, total }) => {
  return res.status(200).json({
    success: true,
    data,
    meta: {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      total,
      pages: Math.ceil(total / limit),
    },
  })
}

const sendError = (
  res,
  message = 'Internal Server Error',
  statusCode = 500,
  errors = null,
) => {
  const body = { success: false, message }
  if (errors) body.errors = errors
  return res.status(statusCode).json(body)
}

module.exports = { sendSuccess, sendCreated, sendPaginated, sendError }
