import { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { AuthContext } from './AuthContext'
import { authService, dashboardService } from '../services/api'

// Cache keys
const USER_CACHE_KEY = 'userCache'
const DASHBOARD_CACHE_KEY = 'dashboardData'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const getCachedUser = () => {
  try {
    const cached = localStorage.getItem(USER_CACHE_KEY)
    if (!cached) return null
    const { user, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(USER_CACHE_KEY)
      return null
    }
    return user
  } catch {
    return null
  }
}

const setCachedUser = (user) => {
  try {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, timestamp: Date.now() }))
  } catch {}
}

const getCachedDashboard = () => {
  try {
    const cached = localStorage.getItem(DASHBOARD_CACHE_KEY)
    if (!cached) return null
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(DASHBOARD_CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

const setCachedDashboard = (data) => {
  try {
    localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setIsLoading(false)
      setShowAuthModal(true)
      return
    }

    // Try cached user first for instant load
    const cachedUser = getCachedUser()
    if (cachedUser) {
      setUser(cachedUser)
      setIsAuthenticated(true)
      setIsLoading(false)
      
      // Refresh in background without blocking UI
      authService.getMe()
        .then(userData => {
          setUser(userData)
          setCachedUser(userData)
        })
        .catch(error => {
          console.error('Auth refresh failed:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem(USER_CACHE_KEY)
          setShowAuthModal(true)
        })
      return
    }

    // No cache, fetch user data
    try {
      const userData = await authService.getMe()
      setUser(userData)
      setCachedUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem(USER_CACHE_KEY)
      setShowAuthModal(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password)
    
    // Optimistic update - use user data from response immediately
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token)
      
      // Prioritize response.user, fallback to response.data.user or empty object
      const userData = response.user || response.data?.user || {}
      setUser(userData)
      setCachedUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      
      // Prefetch dashboard data in background after successful login
      setTimeout(() => {
        dashboardService.getDashboardData()
          .then(dashboardData => {
            setCachedDashboard(dashboardData)
          })
          .catch(() => {})
      }, 100)
    }
    
    return response
  }, [setCachedDashboard])

  const register = useCallback(async (email, password, fullName) => {
    const response = await authService.register(email, password, fullName)
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token)
      
      // Optimistic update - use user data from response immediately
      const userData = response.user || response.data?.user || { email, full_name: fullName }
      setUser(userData)
      setCachedUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      
      // Prefetch dashboard data in background after successful registration
      setTimeout(() => {
        dashboardService.getDashboardData()
          .then(dashboardData => {
            setCachedDashboard(dashboardData)
          })
          .catch(() => {})
      }, 100)
    }
    return response
  }, [setCachedDashboard])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    localStorage.removeItem(USER_CACHE_KEY)
    localStorage.removeItem(DASHBOARD_CACHE_KEY)
    setUser(null)
    setIsAuthenticated(false)
    setShowAuthModal(true)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
      setCachedUser(userData)
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    showAuthModal,
    setShowAuthModal,
    login,
    register,
    logout,
    refreshUser
  }), [user, isAuthenticated, isLoading, showAuthModal, login, register, logout, refreshUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AuthProvider
