const {
  badRequest,
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { fetchSupabaseRows } = require('../_shared/supabaseAdmin')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const body = await parseRequestBody(req)
    const profileId = body.profileId

    if (!profileId) {
      context.res = badRequest('Missing profileId.')
      return
    }

    const rows = await fetchSupabaseRows(
      `bank_connections?select=item_id,institution_name,updated_at&profile_id=eq.${encodeURIComponent(profileId)}&order=updated_at.desc`
    )

    context.res = json(200, {
      success: true,
      accounts: rows || [],
    })
  } catch (error) {
    context.log.error('bank/connections error', error)
    context.res = serverError(error.message)
  }
}
