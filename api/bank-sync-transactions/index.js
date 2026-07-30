const {
  badRequest,
  json,
  methodNotAllowed,
  parseRequestBody,
  serverError,
} = require('../_shared/http')
const { plaidRequest } = require('../_shared/plaid')
const {
  fetchSupabaseRows,
  patchSupabaseRows,
  upsertSupabaseRow,
} = require('../_shared/supabaseAdmin')

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

const syncItemTransactions = async (profileId, connection) => {
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
      profile_id: profileId,
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
    const body = await parseRequestBody(req)
    const profileId = body.profileId

    if (!profileId) {
      context.res = badRequest('Missing profileId.')
      return
    }

    const connections = await fetchSupabaseRows(
      `bank_connections?select=item_id,access_token&profile_id=eq.${encodeURIComponent(profileId)}`
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
      const result = await syncItemTransactions(profileId, connection)
      allImported = [...allImported, ...result.importedTransactions]
      allRemovedIds = [...allRemovedIds, ...result.removedIds]
    }

    const profileRows = await fetchSupabaseRows(
      `budget_profiles?select=device_id,payload&device_id=eq.${encodeURIComponent(profileId)}&limit=1`
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
      `device_id=eq.${encodeURIComponent(profileId)}`,
      {
        payload: updatedPayload,
        updated_at: syncedAt,
      }
    )

    if (!updatedRows.length) {
      await upsertSupabaseRow(
        'budget_profiles',
        {
          device_id: profileId,
          payload: updatedPayload,
          updated_at: syncedAt,
        },
        'device_id'
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
    context.log.error('bank/sync-transactions error', error)
    context.res = serverError(error.message)
  }
}
