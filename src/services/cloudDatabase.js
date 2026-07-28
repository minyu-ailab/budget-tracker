const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const cloudDbEnabled = import.meta.env.VITE_CLOUD_DB_ENABLED === 'true'

const DEVICE_ID_KEY = 'budget-tracker-device-id'

const hasCloudConfig = () => Boolean(supabaseUrl && supabaseAnonKey)

export const isCloudDatabaseEnabled = () => cloudDbEnabled && hasCloudConfig()

const buildHeaders = () => ({
  apikey: supabaseAnonKey,
  Authorization: `Bearer ${supabaseAnonKey}`,
  'Content-Type': 'application/json',
})

const apiBase = () => `${supabaseUrl}/rest/v1/budget_profiles`

export const getOrCreateDeviceId = () => {
  const existing = localStorage.getItem(DEVICE_ID_KEY)
  if (existing) {
    return existing
  }

  const generatedId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  localStorage.setItem(DEVICE_ID_KEY, generatedId)
  return generatedId
}

export const fetchCloudSnapshot = async () => {
  if (!isCloudDatabaseEnabled()) {
    return null
  }

  const deviceId = getOrCreateDeviceId()
  const query = `?select=payload,updated_at&device_id=eq.${encodeURIComponent(deviceId)}&limit=1`
  const response = await fetch(`${apiBase()}${query}`, {
    method: 'GET',
    headers: buildHeaders(),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cloud fetch failed: ${message}`)
  }

  const rows = await response.json()
  return rows?.[0] || null
}

export const saveCloudSnapshot = async (payload) => {
  if (!isCloudDatabaseEnabled()) {
    return null
  }

  const deviceId = getOrCreateDeviceId()
  const row = {
    device_id: deviceId,
    payload,
    updated_at: new Date().toISOString(),
  }

  const response = await fetch(`${apiBase()}?on_conflict=device_id`, {
    method: 'POST',
    headers: {
      ...buildHeaders(),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(row),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Cloud save failed: ${message}`)
  }

  return row
}
