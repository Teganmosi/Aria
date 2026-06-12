import { create } from 'zustand'
import { authService } from '../services/api'
import { setTokens, clearTokens } from '../api/axios'
import type { AuthState, AuthResponse, User } from '../types'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  showAuthModal: false,

  setShowAuthModal: (show: boolean) => set({ showAuthModal: show }),

  checkAuth: async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      set({ isLoading: false, showAuthModal: true })
      return
    }
    try {
      const userData: User = await authService.getMe()
      set({ user: userData, isAuthenticated: true })
    } catch {
      clearTokens()
      set({ showAuthModal: true })
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response: AuthResponse = await authService.login(email, password)
    if (response.access_token) {
      setTokens(response.access_token, response.refresh_token ?? '')
      const userData = response.user ?? response.data?.user ?? ({} as User)
      set({ user: userData, isAuthenticated: true, showAuthModal: false })
    }
    return response
  },

  register: async (email: string, password: string, fullName: string): Promise<AuthResponse> => {
    const response: AuthResponse = await authService.register(email, password, fullName)
    if (response.access_token) {
      setTokens(response.access_token, response.refresh_token ?? '')
      const userData = response.user ?? response.data?.user ?? ({ email, full_name: fullName } as User)
      set({ user: userData, isAuthenticated: true, showAuthModal: false })
    }
    return response
  },

  logout: () => {
    clearTokens()
    set({ user: null, isAuthenticated: false, showAuthModal: true })
  },

  refreshUser: async () => {
    try {
      const userData: User = await authService.getMe()
      set({ user: userData })
    } catch {
      // user stays logged in with stale data — non-critical
    }
  },
}))
