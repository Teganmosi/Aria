import axios, { AxiosRequestConfig } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

export const axiosBase = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Token helpers ────────────────────────────────────────────────────────────

export const getAccessToken = () => localStorage.getItem('authToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('authToken', access)
  localStorage.setItem('refreshToken', refresh)
}

export const clearTokens = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('refreshToken')
}

// ── Request interceptor ──────────────────────────────────────────────────────

axiosPrivate.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — queue-based refresh ───────────────────────────────
// isRefreshing prevents multiple simultaneous refresh calls.
// failedQueue holds requests that arrived while a refresh was in flight.
// retriedConfigs (WeakSet) prevents the same request being retried twice.

let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []
const retriedConfigs = new WeakSet<object>()

const drainQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)))
  failedQueue = []
}

const redirectToLogin = () => {
  if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
    window.location.href = '/login'
  }
}

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.detail ?? error.response?.data?.error ?? error.message)
        : 'Request failed'
      return Promise.reject(new Error(message))
    }

    const originalConfig = error.config as AxiosRequestConfig & object
    const refreshToken = getRefreshToken()

    // No refresh token or already retried → force logout
    if (!refreshToken || retriedConfigs.has(originalConfig)) {
      clearTokens()
      redirectToLogin()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    if (isRefreshing) {
      // Queue this request until the in-flight refresh resolves
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (originalConfig.headers) {
              (originalConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`
            }
            resolve(axiosPrivate(originalConfig))
          },
          reject,
        })
      })
    }

    isRefreshing = true
    retriedConfigs.add(originalConfig)

    try {
      const { data } = await axiosBase.post('/auth/refresh', { refresh_token: refreshToken })
      const { access_token, refresh_token: newRefresh } = data
      setTokens(access_token, newRefresh)
      drainQueue(null, access_token)
      if (originalConfig.headers) {
        (originalConfig.headers as Record<string, string>).Authorization = `Bearer ${access_token}`
      }
      return axiosPrivate(originalConfig)
    } catch (refreshError) {
      drainQueue(refreshError, null)
      clearTokens()
      redirectToLogin()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    } finally {
      isRefreshing = false
    }
  }
)
