import { useEffect, useMemo, useState } from 'react'
import { Link2, RefreshCcw, Building2 } from 'lucide-react'
import { useStore } from '../store/appStore'
import { createBankLinkToken } from '../services/bankApi'
import { formatDate } from '../utils/dateHelpers'
import './Accounts.css'

const PLAID_SCRIPT_SRC = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js'

export default function Accounts() {
  const {
    bankConnections,
    loadConnectedAccounts,
    linkBankAccount,
    syncBankTransactions,
    bankSyncStatus,
    bankLastSyncedAt,
    bankLastImportedCount,
    bankError,
  } = useStore()

  const [linkToken, setLinkToken] = useState(null)
  const [linkTokenError, setLinkTokenError] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [isPlaidReady, setIsPlaidReady] = useState(false)
  const [plaidHandler, setPlaidHandler] = useState(null)

  const isSyncing = bankSyncStatus === 'syncing'

  const sortedConnections = useMemo(
    () =>
      [...bankConnections].sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      ),
    [bankConnections]
  )

  const buildPlaidHandler = (token) => {
    if (!window.Plaid || !token) {
      return null
    }

    return window.Plaid.create({
      token,
      onSuccess: async (publicToken, metadata) => {
        setIsLinking(true)
        setStatusMessage('')

        try {
          const institutionName = metadata?.institution?.name
          const syncResponse = await linkBankAccount({
            publicToken,
            institutionName,
          })
          setStatusMessage(
            `Connected account. Imported ${syncResponse.importedCount || 0} transactions.`
          )
        } catch (error) {
          setStatusMessage(error?.message || 'Failed to link account.')
        } finally {
          setIsLinking(false)
          const newToken = await fetchLinkToken()
          if (newToken && window.Plaid) {
            setPlaidHandler(buildPlaidHandler(newToken))
          }
        }
      },
      onExit: (error) => {
        if (error?.display_message || error?.error_message) {
          setStatusMessage(error.display_message || error.error_message)
        }
      },
    })
  }

  const fetchLinkToken = async () => {
    setLinkTokenError('')
    try {
      const response = await createBankLinkToken()
      setLinkToken(response.linkToken)
      return response.linkToken
    } catch (error) {
      setLinkToken(null)
      setLinkTokenError(error?.message || 'Failed to create Plaid link token.')
      return null
    }
  }

  useEffect(() => {
    if (window.Plaid) {
      setIsPlaidReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = PLAID_SCRIPT_SRC
    script.async = true
    script.onload = () => setIsPlaidReady(true)
    script.onerror = () => {
      setLinkTokenError('Failed to load Plaid Link script.')
    }
    document.body.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  useEffect(() => {
    void loadConnectedAccounts()
  }, [loadConnectedAccounts])

  useEffect(() => {
    if (!isPlaidReady) {
      return
    }

    const initializeHandler = async () => {
      const token = await fetchLinkToken()
      if (!token) {
        return
      }

      setPlaidHandler(buildPlaidHandler(token))
    }

    void initializeHandler()
  }, [isPlaidReady])

  const handleConnectAccount = async () => {
    setStatusMessage('')

    if (!isPlaidReady) {
      setStatusMessage('Plaid is still loading. Please try again in a moment.')
      return
    }

    if (plaidHandler) {
      plaidHandler.open()
      return
    }

    const token = linkToken || (await fetchLinkToken())
    if (!token) {
      return
    }

    const handler = buildPlaidHandler(token)
    setPlaidHandler(handler)
    handler?.open()
  }

  const handleSyncNow = async () => {
    setStatusMessage('')
    try {
      const response = await syncBankTransactions()
      await loadConnectedAccounts()
      setStatusMessage(`Imported ${response.importedCount || 0} new transactions.`)
    } catch {
      // Error state is already captured in store.
    }
  }

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <div>
          <h2>Accounts</h2>
          <p>Link your bank with Plaid and import transactions into your budget.</p>
        </div>
        <div className="accounts-header-actions">
          <button
            className="btn-primary"
            onClick={() => {
              void handleConnectAccount()
            }}
            disabled={isLinking || isSyncing}
          >
            <Link2 size={18} />
            {isLinking ? 'Linking...' : 'Connect Account'}
          </button>
          <button
            className="btn-secondary"
            onClick={() => {
              void handleSyncNow()
            }}
            disabled={isSyncing || isLinking}
          >
            <RefreshCcw size={18} className={isSyncing ? 'spinning' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Transactions'}
          </button>
        </div>
      </div>

      <div className="accounts-status-card">
        <p>
          Sync status: <strong>{bankSyncStatus}</strong>
          {bankLastSyncedAt ? ` • Last synced ${formatDate(bankLastSyncedAt)}` : ''}
        </p>
        <p>Last import count: {bankLastImportedCount}</p>
        {linkTokenError ? <p className="status-error">{linkTokenError}</p> : null}
        {bankError ? <p className="status-error">{bankError}</p> : null}
        {statusMessage ? <p className="status-message">{statusMessage}</p> : null}
      </div>

      <div className="accounts-list-card">
        <div className="accounts-list-header">
          <h3>Connected Accounts</h3>
          <button
            className="btn-secondary"
            onClick={() => {
              void loadConnectedAccounts()
            }}
          >
            Refresh
          </button>
        </div>

        {sortedConnections.length === 0 ? (
          <p className="empty-accounts">No connected accounts yet.</p>
        ) : (
          <ul className="accounts-list">
            {sortedConnections.map((account) => (
              <li key={account.item_id} className="account-item">
                <div className="account-icon">
                  <Building2 size={20} />
                </div>
                <div className="account-content">
                  <p className="account-name">{account.institution_name || 'Linked Bank'}</p>
                  <p className="account-meta">Item: {account.item_id}</p>
                  <p className="account-meta">Updated {formatDate(account.updated_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
