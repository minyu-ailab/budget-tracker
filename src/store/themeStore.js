import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const themeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' or 'dark'
      currency: 'USD',

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),

      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),

      getTheme: () => get().theme,
      getCurrency: () => get().currency,
    }),
    {
      name: 'budget-tracker-theme',
      version: 1,
    }
  )
)
