import { getStoredAccessToken } from './authApi'

const parseErrorMessage = async (response) => {
  try {
    const body = await response.json()
    return body?.error || 'Request failed.'
  } catch {
    return response.statusText || 'Request failed.'
  }
}

const postJson = async (path, body) => {
  const accessToken = getStoredAccessToken()
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json()
}

export const createBankLinkToken = async () =>
  postJson('/api/bank/link-token', {})

export const exchangeBankPublicToken = async ({ publicToken, institutionName }) =>
  postJson(
    '/api/bank/exchange-token',
    {
      publicToken,
      institutionName,
    }
  )

export const listBankConnections = async () =>
  postJson('/api/bank/connections', {})

export const syncBankTransactions = async () =>
  postJson('/api/bank/sync-transactions', {})
