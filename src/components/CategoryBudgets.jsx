import { useState } from 'react'
import { useStore } from '../store/appStore'
import { themeStore } from '../store/themeStore'
import { formatCurrency } from '../utils/dateHelpers'
import './CategoryBudgets.css'

export default function CategoryBudgets() {
  const {
    categories,
    getBudgetLimit,
    setBudgetLimit,
    getCategoryTotal,
    getMonthTransactions,
  } = useStore()
  const { currency } = themeStore()
  const [editingId, setEditingId] = useState(null)
  const [budgetValues, setBudgetValues] = useState({})

  const handleEditBudget = (categoryId) => {
    setEditingId(categoryId)
    setBudgetValues({
      ...budgetValues,
      [categoryId]: getBudgetLimit(categoryId),
    })
  }

  const handleSaveBudget = (categoryId) => {
    const limit = parseFloat(budgetValues[categoryId]) || 0
    setBudgetLimit(categoryId, limit)
    setEditingId(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setBudgetValues({})
  }

  const expenseCategories = categories.filter((c) => c.id !== 'salary')

  return (
    <div className="category-budgets">
      <h2>Category Budgets</h2>

      <div className="budget-list">
        {expenseCategories.map((category) => {
          const limit = getBudgetLimit(category.id)
          const spent = getCategoryTotal(category.id)
          const remaining = limit - spent
          const percentage = limit > 0 ? (spent / limit) * 100 : 0

          return (
            <div key={category.id} className="budget-card">
              <div className="budget-header">
                <div className="budget-title">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </div>
                <span className="budget-amount">
                  {formatCurrency(spent, currency)}
                </span>
              </div>

              <div className="budget-info">
                {editingId === category.id ? (
                  <div className="budget-edit">
                    <input
                      type="number"
                      value={budgetValues[category.id] || ''}
                      onChange={(e) =>
                        setBudgetValues({
                          ...budgetValues,
                          [category.id]: e.target.value,
                        })
                      }
                      placeholder="Set budget limit"
                      step="0.01"
                      min="0"
                    />
                    <button
                      className="btn-small btn-primary"
                      onClick={() => handleSaveBudget(category.id)}
                    >
                      Save
                    </button>
                    <button
                      className="btn-small btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="budget-limit">
                      <span>Limit: {formatCurrency(limit, currency)}</span>
                      <span>Remaining: {formatCurrency(remaining, currency)}</span>
                    </div>
                    <button
                      className="btn-small"
                      onClick={() => handleEditBudget(category.id)}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>

              <div className="budget-progress">
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${remaining < 0 ? 'over-budget' : ''}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <span className="progress-text">
                  {percentage.toFixed(0)}% of budget used
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {expenseCategories.length === 0 && (
        <p className="empty-message">No expense categories available</p>
      )}
    </div>
  )
}
