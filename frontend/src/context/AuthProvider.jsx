import { useState, useEffect, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { AuthContext } from './AuthContext'
import { authService } from '../services/api'

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

    try {
      const userData = await authService.getMe()
      setUser(userData)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('authToken')
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
    localStorage.setItem('authToken', response.access_token)
    setUser(response.user)
    setIsAuthenticated(true)
    setShowAuthModal(false)
    return response
  }, [])

  const register = useCallback(async (email, password, fullName) => {
    const response = await authService.register(email, password, fullName)
    if (response.access_token) {
      localStorage.setItem('authToken', response.access_token)
      setUser(response.user)
      setIsAuthenticated(true)
      setShowAuthModal(false)
    }
    return response
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('authToken')
    setUser(null)
    setIsAuthenticated(false)
    setShowAuthModal(true)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe()
      setUser(userData)
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
