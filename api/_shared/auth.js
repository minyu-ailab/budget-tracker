const { json } = require('./http')

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

const getBearerToken = (req) => {
  const value = req.headers?.authorization || req.headers?.Authorization
  if (!value || typeof value !== 'string' || !value.startsWith('Bearer ')) {
    return null
  }

  return value.slice(7).trim()
}

const requireAuth = async (req) => {
  const token = getBearerToken(req)
  if (!token) {
    throw new AuthError('Missing bearer token.')
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY configuration.')
  }

  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: {
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new AuthError('Invalid or expired token.')
  }

  const user = await response.json()
  return {
    token,
    user,
  }
}

const asAuthResponse = (error) => {
  if (error instanceof AuthError) {
    return json(error.status, {
      error: error.message,
    })
  }

  throw error
}

module.exports = {
  requireAuth,
  asAuthResponse,
  AuthError,
}
