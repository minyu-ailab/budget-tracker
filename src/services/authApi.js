const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const AUTH_ACCESS_TOKEN_KEY = 'budget-tracker-auth-access-token'
export const AUTH_REFRESH_TOKEN_KEY = 'budget-tracker-auth-refresh-token'
export const ACTIVE_USER_ID_KEY = 'budget-tracker-active-user-id'

const ensureAuthConfig = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.')
  }
}

const parseError = async (response) => {
  try {
    const body = await response.json()
    return body.error_description || body.msg || body.message || body.error || 'Request failed.'
  } catch {
    return response.statusText || 'Request failed.'
  }
}

const authHeaders = (token) => ({
  apikey: SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  ...(token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {}),
})

const requestJson = async (url, options) => {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.status === 204 ? null : response.json()
}

const setSessionStorage = ({ accessToken, refreshToken, userId }) => {
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
  localStorage.setItem(ACTIVE_USER_ID_KEY, userId)
}

export const clearSessionStorage = () => {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  localStorage.removeItem(ACTIVE_USER_ID_KEY)
}

export const getStoredAccessToken = () => localStorage.getItem(AUTH_ACCESS_TOKEN_KEY)

export const signUpWithPassword = async ({ email, password, name, phone }) => {
  ensureAuthConfig()

  const data = await requestJson(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email,
      password,
      phone,
      data: {
        full_name: name,
      },
    }),
  })

  return data
}

export const signInWithPassword = async ({ email, password }) => {
  ensureAuthConfig()

  const session = await requestJson(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      email,
      password,
    }),
  })

  const user = await fetchCurrentUser(session.access_token)

  setSessionStorage({
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    userId: user.id,
  })

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user,
  }
}

export const fetchCurrentUser = async (accessToken) => {
  ensureAuthConfig()

  return requestJson(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'GET',
    headers: authHeaders(accessToken),
  })
}

export const signOut = async (accessToken) => {
  ensureAuthConfig()

  try {
    await requestJson(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: authHeaders(accessToken),
    })
  } finally {
    clearSessionStorage()
  }
}

const callAuthedApi = async (path, accessToken, body) => {
  return requestJson(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body || {}),
  })
}

export const initializeUserProfile = async ({ accessToken, fullName, phoneNumber, twoFactorMethod }) => {
  return callAuthedApi('/api/auth/profile', accessToken, {
    fullName,
    phoneNumber,
    twoFactorMethod,
  })
}

export const migrateDeviceProfile = async ({ accessToken, deviceId }) => {
  return callAuthedApi('/api/auth/migrate-device', accessToken, {
    deviceId,
  })
}
