const ensureSupabaseConfig = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY configuration.')
  }
}

const buildUrl = (pathAndQuery) => `${process.env.SUPABASE_URL}/rest/v1/${pathAndQuery}`

const getHeaders = (extra = {}) => ({
  apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  ...extra,
})

const fetchSupabaseRows = async (pathAndQuery) => {
  ensureSupabaseConfig()

  const response = await fetch(buildUrl(pathAndQuery), {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    throw new Error(`Supabase GET failed: ${await response.text()}`)
  }

  return response.json()
}

const upsertSupabaseRow = async (table, row, onConflict) => {
  ensureSupabaseConfig()

  const query = onConflict ? `?on_conflict=${encodeURIComponent(onConflict)}` : ''
  const response = await fetch(buildUrl(`${table}${query}`), {
    method: 'POST',
    headers: getHeaders({
      Prefer: 'resolution=merge-duplicates,return=representation',
    }),
    body: JSON.stringify(row),
  })

  if (!response.ok) {
    throw new Error(`Supabase upsert failed: ${await response.text()}`)
  }

  const rows = await response.json()
  return rows?.[0] || null
}

const patchSupabaseRows = async (table, filterQuery, patch) => {
  ensureSupabaseConfig()

  const response = await fetch(buildUrl(`${table}?${filterQuery}`), {
    method: 'PATCH',
    headers: getHeaders({
      Prefer: 'return=representation',
    }),
    body: JSON.stringify(patch),
  })

  if (!response.ok) {
    throw new Error(`Supabase patch failed: ${await response.text()}`)
  }

  return response.json()
}

module.exports = {
  fetchSupabaseRows,
  upsertSupabaseRow,
  patchSupabaseRows,
}
