import axios, { AxiosRequestConfig } from 'axios'

/**
 * Resolve the backend API base URL. In production builds a missing VITE_API_URL is a
 * hard error — silently falling back to localhost would break every request with no
 * obvious cause. In dev, localhost is a convenient default.
 */
function resolveApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return 'http://localhost:8002/api/v1'
  throw new Error(
    'VITE_API_URL is not configured. Set it to the backend URL, e.g. https://aria-backend.onrender.com/api/v1'
  )
}

export const API_BASE_URL = resolveApiBaseUrl()

export const axiosBase = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

export const axiosPrivate = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ── Error message normalization ───────────────────────────────────────────────
// The backend (FastAPI) reports errors in a `detail` field, but a raw AxiosError
// only carries "Request failed with status code 401" — useless to show users.
// Rewrite err.message so UI catch blocks can display it directly.
const normalizeApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data
    const detail =
      (typeof data?.detail === 'string' && data.detail) ||
      (typeof data?.error === 'string' && data.error) ||
      (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
      error.message
    error.message = detail
  }
  return Promise.reject(error)
}
axiosBase.interceptors.response.use((response) => response, normalizeApiError)

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

// ── Offline Cache & Sync Interceptors ─────────────────────────────────────────

// 1. Offline Request Interceptor
axiosPrivate.interceptors.request.use(
  async (config) => {
    // Inject auth token
    const token = getAccessToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Handle GET request offline cache fallback
    if (config.method?.toLowerCase() === 'get' && !navigator.onLine) {
      const cacheKey = `aria_cache:${config.url}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return {
          ...config,
          adapter: async () => ({
            data: JSON.parse(cached),
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          })
        }
      }
    }

    // Handle POST request offline queueing
    if (config.method?.toLowerCase() === 'post' && !navigator.onLine) {
      const isNote = config.url?.includes('/notes')
      const isPrayer = config.url?.includes('/prayers')
      
      if (isNote || isPrayer) {
        const queueKey = 'aria_sync_queue'
        const currentQueue = JSON.parse(localStorage.getItem(queueKey) || '[]')
        
        const payload = config.data
        const tempId = `temp-${Math.random().toString(36).substr(2, 9)}`
        
        currentQueue.push({
          id: tempId,
          url: config.url,
          data: payload,
          timestamp: new Date().toISOString(),
          type: isNote ? 'note' : 'prayer'
        })
        localStorage.setItem(queueKey, JSON.stringify(currentQueue))
        
        return {
          ...config,
          adapter: async () => ({
            data: {
              ...payload,
              id: tempId,
              created_at: new Date().toISOString(),
              is_temp: true
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config,
          })
        }
      }
    }

    return config
  }
)

// ── Response interceptor — queue-based refresh & offline cache fallback ───────

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
  (response) => {
    // Cache successful GET request responses
    if (response.config.method?.toLowerCase() === 'get' && response.data) {
      const cacheKey = `aria_cache:${response.config.url}`
      localStorage.setItem(cacheKey, JSON.stringify(response.data))
    }
    return response
  },
  async (error: unknown) => {
    // Fallback to cache on GET request network errors (skip on auth 401/403 to allow redirection/refresh)
    if (
      axios.isAxiosError(error) &&
      error.config &&
      error.config.method?.toLowerCase() === 'get' &&
      error.response?.status !== 401 &&
      error.response?.status !== 403
    ) {
      const cacheKey = `aria_cache:${error.config.url}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        return Promise.resolve({
          data: JSON.parse(cached),
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config,
        })
      }
    }

    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.detail ?? error.response?.data?.error ?? error.message)
        : 'Request failed'
      return Promise.reject(new Error(message))
    }

    const originalConfig = error.config as AxiosRequestConfig & object
    const refreshToken = getRefreshToken()

    if (!refreshToken || retriedConfigs.has(originalConfig)) {
      clearTokens()
      redirectToLogin()
      return Promise.reject(new Error('Session expired. Please log in again.'))
    }

    if (isRefreshing) {
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

// ── Offline Sync Queue Processor ──────────────────────────────────────────────

export const processOfflineSyncQueue = async () => {
  const queueKey = 'aria_sync_queue'
  const queue = JSON.parse(localStorage.getItem(queueKey) || '[]')
  if (queue.length === 0) return

  console.info(`[Offline Sync] Replaying ${queue.length} offline queued actions...`)
  
  const remainingQueue = []
  for (const item of queue) {
    try {
      await axiosPrivate.post(item.url, item.data)
      console.info(`[Offline Sync] Successfully synchronized offline item:`, item)
    } catch (err) {
      console.error(`[Offline Sync] Failed to sync item, keeping in queue:`, item, err)
      remainingQueue.push(item)
    }
  }

  localStorage.setItem(queueKey, JSON.stringify(remainingQueue))
  window.dispatchEvent(new Event('aria-sync-complete'))
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    processOfflineSyncQueue()
  })
}
