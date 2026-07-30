const {
  json,
  methodNotAllowed,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')
const { asAuthResponse, requireAuth } = require('../_shared/auth')

const getCountryCodes = () => {
  const envValue = process.env.PLAID_COUNTRY_CODES

  if (!envValue) {
    return ['US']
  }

  const parsed = envValue
    .split(',')
    .map((code) => code.trim().toUpperCase())
    .filter(Boolean)

  return parsed.length ? parsed : ['US']
}

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)

    const linkTokenResponse = await plaidRequest('/link/token/create', {
      client_name: 'Budget Tracker',
      language: 'en',
      country_codes: getCountryCodes(),
      user: {
        client_user_id: user.id,
      },
      products: ['transactions'],
    })

    context.res = json(200, {
      linkToken: linkTokenResponse.link_token,
      expiration: linkTokenResponse.expiration,
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('bank/link-token error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
