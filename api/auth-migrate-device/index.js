const {
  badRequest,
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { asAuthResponse, requireAuth } = require('../_shared/auth')
const {
  fetchSupabaseRows,
  patchSupabaseRows,
  upsertSupabaseRow,
} = require('../_shared/supabaseAdmin')

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)
    const body = await parseRequestBody(req)
    const deviceId = body.deviceId

    if (!deviceId) {
      context.res = badRequest('Missing deviceId.')
      return
    }

    const existingMigration = await fetchSupabaseRows(
      `device_migrations?select=id&device_id=eq.${encodeURIComponent(deviceId)}&user_id=eq.${encodeURIComponent(user.id)}&limit=1`
    )

    if (existingMigration.length) {
      context.res = json(200, {
        success: true,
        migrated: false,
        message: 'Device data was already migrated for this user.',
      })
      return
    }

    const legacyProfiles = await fetchSupabaseRows(
      `budget_profiles?select=payload,updated_at&device_id=eq.${encodeURIComponent(deviceId)}&limit=1`
    )

    if (legacyProfiles.length) {
      await upsertSupabaseRow(
        'budget_profiles',
        {
          user_id: user.id,
          device_id: deviceId,
          payload: legacyProfiles[0].payload || {},
          updated_at: legacyProfiles[0].updated_at || new Date().toISOString(),
        },
        'user_id'
      )
    }

    await patchSupabaseRows(
      'bank_connections',
      `profile_id=eq.${encodeURIComponent(deviceId)}`,
      {
        user_id: user.id,
      }
    )

    await patchSupabaseRows(
      'bank_item_cursors',
      `profile_id=eq.${encodeURIComponent(deviceId)}`,
      {
        user_id: user.id,
      }
    )

    await upsertSupabaseRow(
      'device_migrations',
      {
        device_id: deviceId,
        user_id: user.id,
        migrated_at: new Date().toISOString(),
      },
      'device_id'
    )

    context.res = json(200, {
      success: true,
      migrated: true,
      message: 'Device data migration completed.',
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('auth/migrate-device error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
