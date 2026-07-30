const {
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { asAuthResponse, requireAuth } = require('../_shared/auth')
const { upsertSupabaseRow } = require('../_shared/supabaseAdmin')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)
    const body = await parseRequestBody(req)

    const row = {
      user_id: user.id,
      email: user.email || body.email || '',
      full_name: body.fullName || user.user_metadata?.full_name || '',
      phone_number: body.phoneNumber || user.phone || null,
      two_factor_method: body.twoFactorMethod || 'sms',
      updated_at: new Date().toISOString(),
    }

    const profile = await upsertSupabaseRow('user_profiles', row, 'user_id')

    context.res = json(200, {
      success: true,
      profile,
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('auth/profile error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
