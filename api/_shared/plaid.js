const PLAID_ENV = process.env.PLAID_ENV || 'sandbox'

const PLAID_BASE_URLS = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com',
}

const getPlaidBaseUrl = () => PLAID_BASE_URLS[PLAID_ENV] || PLAID_BASE_URLS.sandbox

const getAuthPayload = () => ({
  client_id: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
})

const assertPlaidEnv = () => {
  if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
    throw new Error('Missing PLAID_CLIENT_ID or PLAID_SECRET configuration.')
  }
}

const plaidRequest = async (path, payload) => {
  assertPlaidEnv()

  const response = await fetch(`${getPlaidBaseUrl()}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...getAuthPayload(),
      ...payload,
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    const detail = data?.error_message || JSON.stringify(data)
    throw new Error(`Plaid request failed: ${detail}`)
  }

  return data
}

module.exports = {
  plaidRequest,
}
