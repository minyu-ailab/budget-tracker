const {
  json,
  methodNotAllowed,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')
const {
  fetchSupabaseRows,
  patchSupabaseRows,
  upsertSupabaseRow,
} = require('../_shared/supabaseAdmin')
const { asAuthResponse, requireAuth } = require('../_shared/auth')

const mapPlaidCategoryToAppCategory = (transaction) => {
  const primary = transaction?.personal_finance_category?.primary || ''
  const merchant = (transaction?.merchant_name || transaction?.name || '').toLowerCase()

  if (primary.includes('FOOD') || merchant.includes('restaurant') || merchant.includes('cafe')) {
    return 'food'
  }

  if (primary.includes('TRANSPORTATION') || merchant.includes('uber') || merchant.includes('lyft')) {
    return 'transport'
  }

  if (primary.includes('ENTERTAINMENT')) {
    return 'entertainment'
  }

  if (primary.includes('MEDICAL')) {
    return 'healthcare'
  }

  if (primary.includes('GENERAL_MERCHANDISE') || primary.includes('SHOPPING')) {
    return 'shopping'
  }

  if (primary.includes('BANK_FEES') || primary.includes('BILLS') || primary.includes('UTILITIES')) {
    return 'utilities'
  }

  return 'other'
}

const toBudgetTransaction = (plaidTransaction, itemId) => {
  const rawAmount = Number(plaidTransaction.amount || 0)
  const isExpense = rawAmount >= 0

  return {
    id: `bank-${plaidTransaction.transaction_id}`,
    name: plaidTransaction.merchant_name || plaidTransaction.name || 'Bank transaction',
    amount: Math.abs(rawAmount),
    type: isExpense ? 'expense' : 'income',
    category: isExpense ? mapPlaidCategoryToAppCategory(plaidTransaction) : 'salary',
    date: plaidTransaction.date,
    notes: `Imported from bank (${itemId})`,
    source: 'bank',
    externalBankTransactionId: plaidTransaction.transaction_id,
  }
}

const mergeTransactions = (existingTransactions, importedTransactions, removedIds) => {
  const existing = Array.isArray(existingTransactions) ? existingTransactions : []
  const removedSet = new Set(removedIds)

  const filtered = existing.filter((transaction) => {
    if (!transaction.externalBankTransactionId) {
      return true
    }

    return !removedSet.has(transaction.externalBankTransactionId)
  })

  const byExternalId = new Map(
    filtered
      .filter((transaction) => transaction.externalBankTransactionId)
      .map((transaction) => [transaction.externalBankTransactionId, transaction])
  )

  for (const imported of importedTransactions) {
    byExternalId.set(imported.externalBankTransactionId, imported)
  }

  const manualOnly = filtered.filter((transaction) => !transaction.externalBankTransactionId)
  return [...manualOnly, ...byExternalId.values()]
}

const syncItemTransactions = async (userId, connection) => {
  const cursorRows = await fetchSupabaseRows(
    `bank_item_cursors?select=item_id,cursor&item_id=eq.${encodeURIComponent(connection.item_id)}&limit=1`
  )

  let cursor = cursorRows?.[0]?.cursor || null
  let hasMore = true
  let added = []
  let removed = []

  while (hasMore) {
    const response = await plaidRequest('/transactions/sync', {
      access_token: connection.access_token,
      cursor,
      count: 100,
    })

    added = [...added, ...(response.added || [])]
    removed = [...removed, ...(response.removed || [])]
    cursor = response.next_cursor
    hasMore = Boolean(response.has_more)
  }

  await upsertSupabaseRow(
    'bank_item_cursors',
    {
      profile_id: userId,
      user_id: userId,
      item_id: connection.item_id,
      cursor: cursor || '',
      last_synced_at: new Date().toISOString(),
    },
    'item_id'
  )

  return {
    importedTransactions: added.map((transaction) =>
      toBudgetTransaction(transaction, connection.item_id)
    ),
    removedIds: removed.map((transaction) => transaction.transaction_id),
  }
}

module.exports = async function (context, req) {
  if (req.method !== 'POST') {
    context.res = methodNotAllowed()
    return
  }

  try {
    const { user } = await requireAuth(req)

    const connections = await fetchSupabaseRows(
      `bank_connections?select=item_id,access_token&user_id=eq.${encodeURIComponent(user.id)}`
    )

    if (!connections.length) {
      context.res = json(200, {
        success: true,
        importedCount: 0,
        message: 'No linked bank accounts found for this profile.',
      })
      return
    }

    let allImported = []
    let allRemovedIds = []

    for (const connection of connections) {
      const result = await syncItemTransactions(user.id, connection)
      allImported = [...allImported, ...result.importedTransactions]
      allRemovedIds = [...allRemovedIds, ...result.removedIds]
    }

    const profileRows = await fetchSupabaseRows(
      `budget_profiles?select=user_id,device_id,payload&user_id=eq.${encodeURIComponent(user.id)}&limit=1`
    )

    const existingPayload = profileRows?.[0]?.payload || {}
    const mergedTransactions = mergeTransactions(
      existingPayload.transactions,
      allImported,
      allRemovedIds
    )

    const syncedAt = new Date().toISOString()

    const updatedPayload = {
      ...existingPayload,
      transactions: mergedTransactions,
      bankSync: {
        lastSyncedAt: syncedAt,
        importedCount: allImported.length,
      },
    }

    const updatedRows = await patchSupabaseRows(
      'budget_profiles',
      `user_id=eq.${encodeURIComponent(user.id)}`,
      {
        payload: updatedPayload,
        updated_at: syncedAt,
      }
    )

    if (!updatedRows.length) {
      await upsertSupabaseRow(
        'budget_profiles',
        {
          user_id: user.id,
          device_id: profileRows?.[0]?.device_id || null,
          payload: updatedPayload,
          updated_at: syncedAt,
        },
        'user_id'
      )
    }

    context.res = json(200, {
      success: true,
      importedCount: allImported.length,
      removedCount: allRemovedIds.length,
      lastSyncedAt: syncedAt,
      transactions: mergedTransactions,
    })
  } catch (error) {
    try {
      context.res = asAuthResponse(error)
    } catch (authUnhandled) {
      context.log.error('bank/sync-transactions error', authUnhandled)
      context.res = serverError(authUnhandled.message)
    }
  }
}
