const {
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')
const { upsertSupabaseRow } = require('../_shared/supabaseAdmin')
const { asAuthResponse, requireAuth } = require('../_shared/auth')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)
    const body = await parseRequestBody(req)
    const { publicToken, institutionName } = body

    if (!publicToken) {
      context.res = json(400, { error: 'Missing publicToken.' })
      return
    }

    const exchangeResponse = await plaidRequest('/item/public_token/exchange', {
      public_token: publicToken,
    })

    const row = {
      profile_id: user.id,
      user_id: user.id,
      item_id: exchangeResponse.item_id,
      access_token: exchangeResponse.access_token,
      institution_name: institutionName || 'Linked Bank',
      updated_at: new Date().toISOString(),
    }

    await upsertSupabaseRow('bank_connections', row, 'item_id')

    context.res = json(200, {
      success: true,
      itemId: exchangeResponse.item_id,
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('bank/exchange-token error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
