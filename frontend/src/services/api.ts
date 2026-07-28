// @ts-nocheck — full TS typing is a follow-up pass; Axios migration done here
import { axiosBase, axiosPrivate, API_BASE_URL } from '../api/axios'

export { API_BASE_URL }

// Used only by chatStream (streaming generator — not compatible with Axios)
const getStreamHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await axiosBase.post('/auth/login', { email, password })
    return data
  },

  register: async (email: string, password: string, fullName: string) => {
    const { data } = await axiosBase.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    return data
  },

  getMe: async () => {
    const { data } = await axiosPrivate.get('/auth/me')
    return data
  },

  logout: async () => {
    const { data } = await axiosPrivate.post('/auth/logout')
    return data
  },

  exchangeOAuthToken: async (accessToken: string) => {
    const { data } = await axiosBase.post('/auth/oauth/exchange', {
      access_token: accessToken,
    })
    return data
  },
}

// Profile Service
export const profileService = {
  getProfile: async () => {
    const { data } = await axiosPrivate.get('/profile')
    return data
  },

  updateProfile: async (profileData: unknown) => {
    const { data } = await axiosPrivate.put('/profile', profileData)
    return data
  },
}

// Bible Service
export const bibleService = {
  getChapter: async (book: string, chapter: number) => {
    const { data } = await axiosBase.get(`/bible/chapter/${encodeURIComponent(book)}/${chapter}`)
    return data
  },

  getVerse: async (book: string, chapter: number, verse: number) => {
    const { data } = await axiosPrivate.get(
      `/bible/verses/${encodeURIComponent(book)}/${chapter}/${verse}`
    )
    return data
  },

  searchVerses: async (query: string) => {
    const { data } = await axiosPrivate.get(`/bible/search?query=${encodeURIComponent(query)}`)
    return data
  },

  createStudySession: async (
    book: string,
    chapter: number,
    verses: string | number[],
    selectedText: string
  ) => {
    let verseList: number[] = []
    if (Array.isArray(verses)) {
      verseList = verses.map((v) => Number.parseInt(String(v), 10)).filter((v) => !Number.isNaN(v))
    } else if (typeof verses === 'string' && verses.trim()) {
      verseList = verses
        .split('-')
        .map((v) => Number.parseInt(v.trim(), 10))
        .filter((v) => !Number.isNaN(v))
    }
    const { data } = await axiosPrivate.post('/bible-study/sessions', {
      book: book.trim(),
      chapter: Number.parseInt(String(chapter), 10),
      verses: verseList,
      selected_text: selectedText,
    })
    return data
  },

  getStudySessions: async () => {
    const { data } = await axiosPrivate.get('/bible-study/sessions')
    return data
  },

  getStudySession: async (sessionId: string) => {
    const { data } = await axiosPrivate.get(`/bible-study/sessions/${sessionId}`)
    return data
  },

  getStudySessionMessages: async (sessionId: string) => {
    const { data } = await axiosPrivate.get(`/bible-study/sessions/${sessionId}/messages`)
    return data
  },

  createStudyMessage: async (sessionId: string, role: string, content: string) => {
    const { data } = await axiosPrivate.post(`/bible-study/sessions/${sessionId}/messages`, {
      role,
      content,
    })
    return data
  },
}

// Emotional Support Service
export const emotionalSupportService = {
  createSession: async (mood: string, situationDescription: string) => {
    const { data } = await axiosPrivate.post('/emotional-support/sessions', {
      mood,
      situation_description: situationDescription,
    })
    return data
  },

  getSessions: async () => {
    const { data } = await axiosPrivate.get('/emotional-support/sessions')
    return data
  },

  getSessionMessages: async (sessionId: string) => {
    const { data } = await axiosPrivate.get(
      `/emotional-support/sessions/${sessionId}/messages`
    )
    return data
  },

  createMessage: async (sessionId: string, role: string, content: string) => {
    const { data } = await axiosPrivate.post(
      `/emotional-support/sessions/${sessionId}/messages`,
      { role, content }
    )
    return data
  },
}

// Devotion Service
export const devotionService = {
  getSettings: async () => {
    const { data } = await axiosPrivate.get('/devotion/settings')
    return data
  },

  saveSettings: async (preferredTime: string, durationMinutes: number | string) => {
    const { data } = await axiosPrivate.put('/devotion/settings', {
      preferred_time: preferredTime,
      duration_minutes: Number.parseInt(String(durationMinutes), 10),
    })
    return data
  },

  scheduleDevotion: async (scheduledFor: string, dayPlanSummary: string) => {
    const { data } = await axiosPrivate.post('/devotion/schedule', {
      scheduled_for: scheduledFor,
      day_plan_summary: dayPlanSummary,
    })
    return data
  },

  getDevotions: async () => {
    const { data } = await axiosPrivate.get('/devotion/devotions')
    return data
  },

  completeDevotion: async (devotionId: string) => {
    const { data } = await axiosPrivate.put(`/devotion/devotions/${devotionId}/complete`)
    return data
  },

  createMessage: async (devotionId: string, role: string, content: string) => {
    const { data } = await axiosPrivate.post(`/devotion/devotions/${devotionId}/messages`, {
      role,
      content,
    })
    return data
  },
}

// AI Service
export const aiService = {
  generate: async (messages: unknown, mode: string) => {
    const { data } = await axiosPrivate.post('/ai/generate', { messages, mode })
    return data
  },
}

// Dedicated AI Chat Service with Persistence
export const aiChatService = {
  getSessions: async () => {
    const { data } = await axiosPrivate.get('/ai-chat/sessions')
    return data
  },

  getWelcomeGreeting: async () => {
    const { data } = await axiosPrivate.get('/ai/welcome-greeting')
    return data
  },

  getMessages: async (sessionId: string) => {
    const { data } = await axiosPrivate.get(`/ai-chat/sessions/${sessionId}/messages`)
    return data
  },

  chat: async (messages: unknown, sessionId: string | null = null, mode = 'general') => {
    const url = sessionId ? `/ai/chat?session_id=${sessionId}` : '/ai/chat'
    const { data } = await axiosPrivate.post(url, { messages, mode })
    return data
  },

  // Streaming generator — kept on native fetch; Axios does not support async generators
  chatStream: async function* (
    messages: unknown,
    sessionId: string | null = null,
    mode = 'general'
  ) {
    const url = sessionId
      ? `${API_BASE_URL}/ai/chat/stream?session_id=${sessionId}`
      : `${API_BASE_URL}/ai/chat/stream`

    let response = await fetch(url, {
      method: 'POST',
      headers: getStreamHeaders(),
      body: JSON.stringify({ messages, mode }),
    })

    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          })

          if (refreshResponse.ok) {
            const data = await refreshResponse.json()
            if (data.access_token) {
              localStorage.setItem('authToken', data.access_token)
              if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token)
              }
              // Retry the streaming fetch with the new token
              response = await fetch(url, {
                method: 'POST',
                headers: getStreamHeaders(),
                body: JSON.stringify({ messages, mode }),
              })
            }
          }
        } catch (refreshError) {
          console.error('Token refresh failed in chatStream:', refreshError)
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('authUser')
        if (
          !globalThis.location.pathname.includes('/login') &&
          !globalThis.location.pathname.includes('/register')
        ) {
          globalThis.location.href = '/login'
        }
      }
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      yield decoder.decode(value, { stream: true })
    }
  },
}

// Voice Call Service — WebSocket-based real-time voice

function resolveWsHost(): string {
  const fromEnv = import.meta.env.VITE_WS_URL
  if (fromEnv) return fromEnv
  if (import.meta.env.DEV) return 'localhost:8002'
  throw new Error(
    'VITE_WS_URL is not configured. Set it to the backend WebSocket host, e.g. wss://aria-backend.onrender.com'
  )
}

export const voiceCallService = {
  // No token in the URL — URLs leak into logs. The component sends the token as the
  // first WebSocket message after connecting (see VoiceCall.tsx).
  getWebSocketUrl: (callId: string) => {
    let wsHost = resolveWsHost()
    wsHost = wsHost.replace(/^(wss?):\/\//, '')
    const isLocalhost = wsHost.startsWith('localhost') || wsHost.startsWith('127.0.0.1')
    const wsProtocol = (!isLocalhost || globalThis.location.protocol === 'https:') ? 'wss:' : 'ws:'
    return `${wsProtocol}//${wsHost}/ws/voice-call/${callId}`
  },

  createCallSession: async (mode = 'general') => {
    const { data } = await axiosPrivate.post('/ai/voice-session', { mode })
    return data
  },
}

// Home Service
export const homeService = {
  getHomeData: async () => {
    const { data } = await axiosPrivate.get('/home/data')
    return data
  },

  getVerse: async () => {
    const { data } = await axiosPrivate.get('/home/verse')
    return data
  },

  getActivity: async (limit = 5) => {
    const { data } = await axiosPrivate.get(`/home/activity?limit=${limit}`)
    return data
  },

  getStats: async () => {
    const { data } = await axiosPrivate.get('/home/stats')
    return data
  },
}

// Dashboard Service — Combined data for faster initial load
export const dashboardService = {
  getDashboardData: async () => {
    try {
      const { data } = await axiosPrivate.get('/dashboard')
      return data
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null
      }
      throw err
    }
  },
}

// Prayer Service
export const prayerService = {
  createPrayer: async (prayerData: unknown) => {
    const { data } = await axiosPrivate.post('/prayers', prayerData)
    return data
  },

  getPrayers: async () => {
    const { data } = await axiosPrivate.get('/prayers')
    return data
  },

  deletePrayer: async (prayerId: string) => {
    const { data } = await axiosPrivate.delete(`/prayers/${prayerId}`)
    return data
  },
}

// Notes Service
export const notesService = {
  createNote: async (noteData: unknown) => {
    const { data } = await axiosPrivate.post('/notes', noteData)
    return data
  },

  getNotes: async (sourceType: string | null = null) => {
    const url = sourceType
      ? `/notes?source_type=${encodeURIComponent(sourceType)}`
      : '/notes'
    const { data } = await axiosPrivate.get(url)
    return data
  },

  getNote: async (noteId: string) => {
    const { data } = await axiosPrivate.get(`/notes/${noteId}`)
    return data
  },

  updateNote: async (noteId: string, noteData: unknown) => {
    const { data } = await axiosPrivate.put(`/notes/${noteId}`, noteData)
    return data
  },

  deleteNote: async (noteId: string) => {
    const { data } = await axiosPrivate.delete(`/notes/${noteId}`)
    return data
  },

  unlockNote: async (noteId: string, password: string) => {
    const { data } = await axiosPrivate.post(`/notes/${noteId}/unlock`, { password })
    return data
  },
}

// Text to Speech Service

// <audio> elements cannot send Authorization headers, so the GET /tts endpoint takes a
// token in the query string. We never put the main access token there (it would leak into
// server/proxy logs and browser history) — instead we fetch a short-lived, purpose-built
// audio token and cache it until just before expiry.
let cachedAudioToken: { token: string; expiresAt: number } | null = null

async function getTtsAudioToken(): Promise<string> {
  const now = Date.now()
  if (cachedAudioToken && cachedAudioToken.expiresAt - now > 30_000) {
    return cachedAudioToken.token
  }
  const { data } = await axiosPrivate.post('/tts/audio-token')
  cachedAudioToken = {
    token: data.audio_token,
    expiresAt: now + (data.expires_in_seconds ?? 300) * 1000,
  }
  return cachedAudioToken.token
}

/** Drop the cached audio token (call on logout). */
export function clearTtsAudioTokenCache(): void {
  cachedAudioToken = null
}

export const ttsService = {
  generateSpeech: async (text: string, voice = 'Idera', responseFormat = 'mp3'): Promise<Blob> => {
    const { data } = await axiosPrivate.post(
      '/tts',
      { text, voice, response_format: responseFormat },
      { responseType: 'blob' }
    )
    return data
  },
  getSpeechUrl: async (text: string, voice = 'Idera', responseFormat = 'mp3'): Promise<string> => {
    const token = await getTtsAudioToken()
    const params = new URLSearchParams({
      text,
      voice,
      response_format: responseFormat,
      token,
    })
    return `${API_BASE_URL}/tts?${params.toString()}`
  },
}

