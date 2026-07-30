import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  ACTIVE_USER_ID_KEY,
  AUTH_ACCESS_TOKEN_KEY,
  AUTH_REFRESH_TOKEN_KEY,
  clearSessionStorage,
  fetchCurrentUser,
  getStoredAccessToken,
  initializeUserProfile,
  migrateDeviceProfile,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from '../services/authApi'
import { getOrCreateDeviceId } from '../services/cloudDatabase'

const clearAuthKeys = () => {
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  localStorage.removeItem(ACTIVE_USER_ID_KEY)
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      status: 'loading',
      accessToken: null,
      refreshToken: null,
      user: null,
      error: null,
      infoMessage: '',

      initializeAuth: async () => {
        const storedToken = getStoredAccessToken()

        if (!storedToken) {
          clearAuthKeys()
          set({
            status: 'anonymous',
            accessToken: null,
            refreshToken: null,
            user: null,
            error: null,
            infoMessage: '',
          })
          return
        }

        set({ status: 'loading', error: null })

        try {
          const user = await fetchCurrentUser(storedToken)
          localStorage.setItem(ACTIVE_USER_ID_KEY, user.id)
          set({
            status: 'authenticated',
            accessToken: storedToken,
            user,
            error: null,
          })
        } catch {
          clearAuthKeys()
          set({
            status: 'anonymous',
            accessToken: null,
            refreshToken: null,
            user: null,
            error: null,
            infoMessage: 'Session expired. Please sign in again.',
          })
        }
      },

      signUp: async ({ email, password, name, phone, twoFactorMethod }) => {
        set({ status: 'loading', error: null, infoMessage: '' })

        try {
          const response = await signUpWithPassword({ email, password, name, phone })

          const accessToken = response?.access_token
          const refreshToken = response?.refresh_token
          const user = response?.user

          if (!accessToken || !user) {
            set({
              status: 'anonymous',
              error: null,
              infoMessage: 'Account created. Please confirm your email, then sign in.',
            })
            return
          }

          localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken)
          if (refreshToken) {
            localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken)
          }
          localStorage.setItem(ACTIVE_USER_ID_KEY, user.id)

          await initializeUserProfile({
            accessToken,
            fullName: name,
            phoneNumber: phone,
            twoFactorMethod,
          })

          set({
            status: 'authenticated',
            accessToken,
            refreshToken: refreshToken || null,
            user,
            error: null,
            infoMessage: 'Account created successfully.',
          })
        } catch (error) {
          set({
            status: 'anonymous',
            error: error?.message || 'Failed to create account.',
            infoMessage: '',
          })
          throw error
        }
      },

      signIn: async ({ email, password }) => {
        set({ status: 'loading', error: null, infoMessage: '' })

        try {
          const session = await signInWithPassword({ email, password })

          await migrateDeviceProfile({
            accessToken: session.accessToken,
            deviceId: getOrCreateDeviceId(),
          })

          set({
            status: 'authenticated',
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            user: session.user,
            error: null,
            infoMessage: '',
          })
        } catch (error) {
          clearSessionStorage()
          set({
            status: 'anonymous',
            accessToken: null,
            refreshToken: null,
            user: null,
            error: error?.message || 'Failed to sign in.',
            infoMessage: '',
          })
          throw error
        }
      },

      signOutCurrentUser: async () => {
        const token = get().accessToken
        await signOut(token)
        set({
          status: 'anonymous',
          accessToken: null,
          refreshToken: null,
          user: null,
          error: null,
          infoMessage: 'Signed out successfully.',
        })
      },
    }),
    {
      name: 'budget-tracker-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
)
