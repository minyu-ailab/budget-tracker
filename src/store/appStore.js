import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMonthKey } from '../utils/dateHelpers'
import {
  fetchCloudSnapshot,
  isCloudDatabaseEnabled,
  saveCloudSnapshot,
} from '../services/cloudDatabase'
import {
  exchangeBankPublicToken,
  listBankConnections,
  syncBankTransactions as syncBankTransactionsApi,
} from '../services/bankApi'

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

const normalizeImportedState = (data = {}) => ({
  transactions: Array.isArray(data.transactions) ? data.transactions : [],
  categories:
    Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories
      : DEFAULT_CATEGORIES,
  monthlyBudgets:
    data.monthlyBudgets && typeof data.monthlyBudgets === 'object'
      ? data.monthlyBudgets
      : {},
  bankLastSyncedAt:
    data.bankSync && typeof data.bankSync === 'object'
      ? data.bankSync.lastSyncedAt || null
      : null,
  bankLastImportedCount:
    data.bankSync && typeof data.bankSync === 'object'
      ? Number(data.bankSync.importedCount || 0)
      : 0,
})

const createCloudPayload = (state) => ({
  transactions: state.transactions,
  categories: state.categories,
  monthlyBudgets: state.monthlyBudgets,
  bankSync: {
    lastSyncedAt: state.bankLastSyncedAt,
    importedCount: state.bankLastImportedCount,
  },
})

const syncToCloud = async (get, set) => {
  if (!isCloudDatabaseEnabled()) {
    return
  }

  set({ cloudSyncStatus: 'syncing', cloudError: null })

  try {
    const payload = createCloudPayload(get())
    await saveCloudSnapshot(payload)
    set({
      cloudSyncStatus: 'ready',
      cloudLastSyncedAt: new Date().toISOString(),
      cloudError: null,
    })
  } catch (error) {
    set({
      cloudSyncStatus: 'error',
      cloudError: error?.message || 'Failed to sync to cloud database.',
    })
  }
}

const setAndSync = (set, get, updater) => {
  set(updater)
  void syncToCloud(get, set)
}

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      categories: DEFAULT_CATEGORIES,
      monthlyBudgets: {}, // { "2024-01": { categoryId: limit } }
      selectedMonth: new Date(),
      cloudSyncStatus: isCloudDatabaseEnabled() ? 'idle' : 'disabled',
      cloudLastSyncedAt: null,
      cloudError: null,
      bankConnections: [],
      bankSyncStatus: 'idle',
      bankLastSyncedAt: null,
      bankLastImportedCount: 0,
      bankError: null,
      transactionSourceFilter: 'all',

      // Transactions
      addTransaction: (transaction) =>
        setAndSync(set, get, (state) => ({
          transactions: [...state.transactions, { ...transaction, id: Date.now().toString() }],
        })),

      updateTransaction: (id, updates) =>
        setAndSync(set, get, (state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTransaction: (id) =>
        setAndSync(set, get, (state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      // Categories
      addCategory: (category) =>
        setAndSync(set, get, (state) => ({
          categories: [...state.categories, { ...category, id: Date.now().toString() }],
        })),

      updateCategory: (id, updates) =>
        setAndSync(set, get, (state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteCategory: (id) =>
        setAndSync(set, get, (state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Budget limits
      setBudgetLimit: (categoryId, limit) =>
        setAndSync(set, get, (state) => {
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

      replaceData: (importedData) => {
        const normalized = normalizeImportedState(importedData)
        set(normalized)
        void syncToCloud(get, set)
      },

      clearAllData: () =>
        setAndSync(set, get, {
          transactions: [],
          categories: DEFAULT_CATEGORIES,
          monthlyBudgets: {},
          bankLastSyncedAt: null,
          bankLastImportedCount: 0,
        }),

      syncCloudNow: async () => {
        await syncToCloud(get, set)
      },

      isCloudEnabled: () => isCloudDatabaseEnabled(),

      loadConnectedAccounts: async () => {
        set({ bankError: null })

        try {
          const response = await listBankConnections()
          set({
            bankConnections: Array.isArray(response.accounts) ? response.accounts : [],
            bankError: null,
          })
          return response
        } catch (error) {
          set({
            bankError: error?.message || 'Failed to load connected accounts.',
          })
          throw error
        }
      },

      syncBankTransactions: async () => {
        set({
          bankSyncStatus: 'syncing',
          bankError: null,
        })

        try {
          const response = await syncBankTransactionsApi()
          set({
            transactions: Array.isArray(response.transactions)
              ? response.transactions
              : get().transactions,
            bankSyncStatus: 'ready',
            bankLastSyncedAt: response.lastSyncedAt || new Date().toISOString(),
            bankLastImportedCount: Number(response.importedCount || 0),
            bankError: null,
          })
          return response
        } catch (error) {
          set({
            bankSyncStatus: 'error',
            bankError: error?.message || 'Failed to sync bank transactions.',
          })
          throw error
        }
      },

      linkBankAccount: async ({ publicToken, institutionName }) => {
        await exchangeBankPublicToken({ publicToken, institutionName })
        await get().loadConnectedAccounts()
        return get().syncBankTransactions()
      },

      setTransactionSourceFilter: (filter) => {
        set({ transactionSourceFilter: filter })
      },

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

      initializeStore: async () => {
        if (!isCloudDatabaseEnabled()) {
          set({ cloudSyncStatus: 'disabled', cloudError: null })
          return
        }

        set({ cloudSyncStatus: 'syncing', cloudError: null })

        try {
          const cloudRow = await fetchCloudSnapshot()
          const payload = cloudRow?.payload

          if (payload) {
            const normalized = normalizeImportedState(payload)
            set({
              ...normalized,
              cloudSyncStatus: 'ready',
              cloudLastSyncedAt: cloudRow.updated_at || new Date().toISOString(),
              bankSyncStatus: 'ready',
              cloudError: null,
            })
            return
          }

          await syncToCloud(get, set)
        } catch (error) {
          set({
            cloudSyncStatus: 'error',
            cloudError: error?.message || 'Failed to load from cloud database.',
          })
        }
      },
    }),
    {
      name: 'budget-tracker-store',
      version: 1,
    }
  )
)
