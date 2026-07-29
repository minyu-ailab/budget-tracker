const {
  badRequest,
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')
const { upsertSupabaseRow } = require('../_shared/supabaseAdmin')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const body = await parseRequestBody(req)
    const { profileId, publicToken, institutionName } = body

    if (!profileId || !publicToken) {
      context.res = badRequest('Missing profileId or publicToken.')
      return
    }

    const exchangeResponse = await plaidRequest('/item/public_token/exchange', {
      public_token: publicToken,
    })

    const row = {
      profile_id: profileId,
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
    context.log.error('bank/exchange-token error', error)
    context.res = serverError(error.message)
  }
}
