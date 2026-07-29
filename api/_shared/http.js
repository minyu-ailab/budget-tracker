const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

const json = (status, body) => ({
  status,
  headers: DEFAULT_HEADERS,
  body: JSON.stringify(body),
})

const parseRequestBody = async (req) => {
  if (!req.body) {
    return {}
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body)
  }

  return req.body
}

const methodNotAllowed = () =>
  json(405, {
    error: 'Method not allowed.',
  })

const badRequest = (message) =>
  json(400, {
    error: message,
  })

const serverError = (message = 'Unexpected server error.') =>
  json(500, {
    error: message,
  })

module.exports = {
  json,
  parseRequestBody,
  methodNotAllowed,
  badRequest,
  serverError,
}
