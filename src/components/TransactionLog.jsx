import { useState } from 'react'
import { Trash2, Edit2, Plus } from 'lucide-react'
import { useStore } from '../store/appStore'
import { themeStore } from '../store/themeStore'
import { formatCurrency, formatDate } from '../utils/dateHelpers'
import { validateTransaction } from '../utils/validators'
import TransactionForm from './TransactionForm'
import './TransactionLog.css'

export default function TransactionLog() {
  const {
    getMonthTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
  } = useStore()
  const { currency } = themeStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  const monthTransactions = getMonthTransactions()

  const filteredTransactions = monthTransactions.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || t.type === filterType
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory
    return matchesSearch && matchesType && matchesCategory
  })

  const handleAddTransaction = (transaction) => {
    const { isValid } = validateTransaction(transaction)
    if (isValid) {
      addTransaction(transaction)
      setShowForm(false)
    }
  }

  const handleUpdateTransaction = (transaction) => {
    const { isValid } = validateTransaction(transaction)
    if (isValid) {
      updateTransaction(editingId, transaction)
      setEditingId(null)
    }
  }

  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id)
    }
  }

  const getCategoryName = (categoryId) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  const editingTransaction = monthTransactions.find((t) => t.id === editingId)

  return (
    <div className="transaction-log">
      <div className="transaction-header">
        <h2>Transactions</h2>
        <button
          className="btn-primary"
          onClick={() => {
            setEditingId(null)
            setShowForm(!showForm)
          }}
        >
          <Plus size={20} /> Add Transaction
        </button>
      </div>

      {(showForm || editingId) && (
        <TransactionForm
          onSubmit={editingId ? handleUpdateTransaction : handleAddTransaction}
          onCancel={() => {
            setShowForm(false)
            setEditingId(null)
          }}
          initialData={editingTransaction}
        />
      )}

      <div className="filters">
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="transactions-list">
        {filteredTransactions.length === 0 ? (
          <p className="empty-message">No transactions found</p>
        ) : (
          filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div className="transaction-info">
                <div className="transaction-header-row">
                  <span className="transaction-name">{transaction.name}</span>
                  <span className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount, currency)}
                  </span>
                </div>
                <div className="transaction-meta">
                  <span className="category-badge">
                    {getCategoryName(transaction.category)}
                  </span>
                  <span className="transaction-date">
                    {formatDate(transaction.date)}
                  </span>
                  {transaction.notes && (
                    <span className="transaction-notes">{transaction.notes}</span>
                  )}
                </div>
              </div>
              <div className="transaction-actions">
                <button
                  className="btn-icon"
                  onClick={() => setEditingId(transaction.id)}
                  title="Edit"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteTransaction(transaction.id)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
