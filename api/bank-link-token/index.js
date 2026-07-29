const {
  badRequest,
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')

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

    const linkTokenResponse = await plaidRequest('/link/token/create', {
      client_name: 'Budget Tracker',
      language: 'en',
      country_codes: ['US'],
      user: {
        client_user_id: profileId,
      },
      products: ['transactions'],
    })

    context.res = json(200, {
      linkToken: linkTokenResponse.link_token,
      expiration: linkTokenResponse.expiration,
    })
  } catch (error) {
    context.log.error('bank/link-token error', error)
    context.res = serverError(error.message)
  }
}
