import { create } from 'zustand'
import { authService } from '../services/api'
import { setTokens, clearTokens } from '../api/axios'
import type { AuthState, AuthResponse, User } from '../types'

const getInitialToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

const getInitialUser = (): User | null => {
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem('authUser')
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }
  return null
}

const initialToken = getInitialToken()
const initialUser = getInitialUser()

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: !!initialToken,
  isLoading: !!initialToken, // If token exists, load in background. If not, stop loading.
  showAuthModal: !initialToken,

  setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),

  checkAuth: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      localStorage.removeItem('authUser')
      set({ user: null, isAuthenticated: false, isLoading: false, showAuthModal: true })
      return
    }
    try {
      const userData: User = await authService.getMe()
      localStorage.setItem('authUser', JSON.stringify(userData))
      set({ user: userData, isAuthenticated: true })
    } catch {
      clearTokens()
      localStorage.removeItem('authUser')
      set({ user: null, isAuthenticated: false, showAuthModal: true })
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AuthResponse = await authService.login(email, password)
    if (response.access_token) {
      setTokens(response.access_token, response.refresh_token ?? '')
      const userData = response.user ?? response.data?.user ?? ({} as User)
      localStorage.setItem('authUser', JSON.stringify(userData))
      set({ user: userData, isAuthenticated: true, showAuthModal: false })
    }
    return response
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response: AuthResponse = await authService.register(email, password, fullName)
    if (response.access_token) {
      setTokens(response.access_token, response.refresh_token ?? '')
      const userData = response.user ?? response.data?.user ?? ({ email, full_name: fullName } as User)
      localStorage.setItem('authUser', JSON.stringify(userData))
      set({ user: userData, isAuthenticated: true, showAuthModal: false })
    }
    return response
  },

  logout: () => {
    clearTokens()
    localStorage.removeItem('authUser')
    set({ user: null, isAuthenticated: false, showAuthModal: true })
  },

  refreshUser: async () => {
    try {
      const userData: User = await authService.getMe()
      localStorage.setItem('authUser', JSON.stringify(userData))
      set({ user: userData })
    } catch {
      // user stays logged in with stale data — non-critical
    }
  },

  exchangeOAuthToken: async (accessToken: string, refreshToken?: string): Promise<AuthResponse> => {
    const response: AuthResponse = await authService.exchangeOAuthToken(accessToken)
    if (response.access_token) {
      setTokens(response.access_token, response.refresh_token ?? refreshToken ?? '')
      const userData = response.user ?? response.data?.user ?? ({} as User)
      localStorage.setItem('authUser', JSON.stringify(userData))
      set({ user: userData, isAuthenticated: true, showAuthModal: false })
    }
    return response
  },
}))
