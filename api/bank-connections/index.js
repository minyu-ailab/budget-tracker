const {
  json,
  methodNotAllowed,
  serverError,
} = require('../_shared/http')
const { fetchSupabaseRows } = require('../_shared/supabaseAdmin')
const { asAuthResponse, requireAuth } = require('../_shared/auth')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)

    const rows = await fetchSupabaseRows(
      `bank_connections?select=item_id,institution_name,updated_at&user_id=eq.${encodeURIComponent(user.id)}&order=updated_at.desc`
    )

    context.res = json(200, {
      success: true,
      accounts: rows || [],
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('bank/connections error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
