import { getOrCreateDeviceId } from './cloudDatabase'

const parseErrorMessage = async (response) => {
  try {
    const body = await response.json()
    return body?.error || 'Request failed.'
  } catch {
    return response.statusText || 'Request failed.'
  }
}

const postJson = async (path, body) => {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return response.json()
}

const withProfileId = (payload = {}) => ({
  profileId: getOrCreateDeviceId(),
  ...payload,
})

export const createBankLinkToken = async () =>
  postJson('/api/bank/link-token', withProfileId())

export const exchangeBankPublicToken = async ({ publicToken, institutionName }) =>
  postJson(
    '/api/bank/exchange-token',
    withProfileId({
      publicToken,
      institutionName,
    })
  )

export const listBankConnections = async () =>
  postJson('/api/bank/connections', withProfileId())

export const syncBankTransactions = async () =>
  postJson('/api/bank/sync-transactions', withProfileId())
