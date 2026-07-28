import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMonthKey } from '../utils/dateHelpers'

const DEFAULT_CATEGORIES = [
  { id: 'food', name: 'Food & Dining', color: '#ff6b6b', icon: '🍔' },
  { id: 'transport', name: 'Transport', color: '#4ecdc4', icon: '🚗' },
  { id: 'entertainment', name: 'Entertainment', color: '#95e1d3', icon: '🎮' },
  { id: 'utilities', name: 'Utilities', color: '#f38181', icon: '💡' },
  { id: 'healthcare', name: 'Healthcare', color: '#aa96da', icon: '🏥' },
  { id: 'shopping', name: 'Shopping', color: '#fcbad3', icon: '🛍️' },
  { id: 'salary', name: 'Salary', color: '#a8e6cf', icon: '💰' },
  { id: 'other', name: 'Other', color: '#dda0dd', icon: '📌' },
]

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      monthlyBudgets: {}, // { "2024-01": { categoryId: limit } }
      selectedMonth: new Date(),

      // Transactions
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: Date.now().toString() }],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // Categories
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, { ...category, id: Date.now().toString() }],
        })),

      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Budget limits
      setBudgetLimit: (categoryId, limit) =>
        set((state) => {
          const monthKey = getMonthKey(state.selectedMonth)
          return {
            monthlyBudgets: {
              ...state.monthlyBudgets,
              [monthKey]: {
                ...state.monthlyBudgets[monthKey],
                [categoryId]: limit,
              },
            },
          }
        }),

      // Month navigation
      setSelectedMonth: (date) => set({ selectedMonth: date }),

      // Selectors
      getMonthTransactions: () => {
        const { transactions, selectedMonth } = get()
        const monthKey = getMonthKey(selectedMonth)
        return transactions.filter((t) => getMonthKey(t.date) === monthKey)
      },

      getTotalIncome: () => {
        const monthTransactions = get().getMonthTransactions()
        return monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getTotalExpenses: () => {
        const monthTransactions = get().getMonthTransactions()
        return monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getBalance: () => {
        return get().getTotalIncome() - get().getTotalExpenses()
      },

      getCategoryTotal: (categoryId) => {
        const monthTransactions = get().getMonthTransactions()
        return monthTransactions
          .filter((t) => t.category === categoryId && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0)
      },

      getCategoryBreakdown: () => {
        const { categories } = get()
        return categories
          .filter((c) => c.id !== 'salary')
          .map((c) => ({
            ...c,
            spent: get().getCategoryTotal(c.id),
          }))
      },

      getBudgetLimit: (categoryId) => {
        const { monthlyBudgets, selectedMonth } = get()
        const monthKey = getMonthKey(selectedMonth)
        return monthlyBudgets[monthKey]?.[categoryId] || 0
      },

      initializeStore: () => {
        // Load from IndexedDB or localStorage if needed
        // Currently using Zustand's persist middleware
      },
    }),
    {
      name: 'budget-tracker-store',
      version: 1,
    }
  )
)
