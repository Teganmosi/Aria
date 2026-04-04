export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8002/api/v1'

const getHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(error.error || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

// Auth Service
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(response)
  },

  register: async (email, password, fullName) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    })
    return handleResponse(response)
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// Profile Service
export const profileService = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    })
    return handleResponse(response)
  },
}

// Bible Service
export const bibleService = {
  getChapter: async (book, chapter) => {
    const response = await fetch(`${API_BASE_URL}/bible/chapter/${encodeURIComponent(book)}/${chapter}`)
    return handleResponse(response)
  },

  getVerse: async (book, chapter, verse) => {
    const response = await fetch(`${API_BASE_URL}/bible/verses/${encodeURIComponent(book)}/${chapter}/${verse}`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  searchVerses: async (query) => {
    const response = await fetch(`${API_BASE_URL}/bible/search?query=${encodeURIComponent(query)}`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  createStudySession: async (book, chapter, verses, selectedText) => {
    const response = await fetch(`${API_BASE_URL}/bible-study/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        book: book.trim(),
        chapter: parseInt(chapter),
        verses: verses.split('-').map(v => parseInt(v.trim())),
        selected_text: selectedText,
      }),
    })
    return handleResponse(response)
  },

  getStudySessions: async () => {
    const response = await fetch(`${API_BASE_URL}/bible-study/sessions`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getStudySession: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/bible-study/sessions/${sessionId}`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getStudySessionMessages: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/bible-study/sessions/${sessionId}/messages`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// Emotional Support Service
export const emotionalSupportService = {
  createSession: async (mood, situationDescription) => {
    const response = await fetch(`${API_BASE_URL}/emotional-support/sessions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        mood,
        situation_description: situationDescription,
      }),
    })
    return handleResponse(response)
  },

  getSessions: async () => {
    const response = await fetch(`${API_BASE_URL}/emotional-support/sessions`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getSessionMessages: async (sessionId) => {
    const response = await fetch(`${API_BASE_URL}/emotional-support/sessions/${sessionId}/messages`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// Devotion Service
export const devotionService = {
  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/devotion/settings`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  saveSettings: async (preferredTime, durationMinutes) => {
    const response = await fetch(`${API_BASE_URL}/devotion/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        preferred_time: preferredTime,
        duration_minutes: parseInt(durationMinutes),
      }),
    })
    return handleResponse(response)
  },

  scheduleDevotion: async (scheduledFor, dayPlanSummary) => {
    const response = await fetch(`${API_BASE_URL}/devotion/schedule`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        scheduled_for: scheduledFor,
        day_plan_summary: dayPlanSummary,
      }),
    })
    return handleResponse(response)
  },

  getDevotions: async () => {
    const response = await fetch(`${API_BASE_URL}/devotion/devotions`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  completeDevotion: async (devotionId) => {
    const response = await fetch(`${API_BASE_URL}/devotion/devotions/${devotionId}/complete`, {
      method: 'PUT',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// AI Service
export const aiService = {
  generate: async (messages, mode) => {
    const response = await fetch(`${API_BASE_URL}/ai/generate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages, mode }),
    })
    return handleResponse(response)
  },

  chat: async (messages, mode = 'general') => {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messages, mode }),
    })
    return handleResponse(response)
  },
}

// Voice Call Service - WebSocket-based real-time voice
export const voiceCallService = {
  // Get WebSocket URL for voice calls
  getWebSocketUrl: (callId) => {
    // VITE_WS_URL should be just the host, e.g., "localhost:8002"
    let wsHost = import.meta.env.VITE_WS_URL || 'localhost:8002'
    // Remove protocol if present to avoid double protocol
    wsHost = wsHost.replace(/^(ws|wss):\/\//, '')
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const token = localStorage.getItem('authToken')
    return `${wsProtocol}//${wsHost}/ws/voice-call/${callId}?token=${token}`
  },

  // Create a new voice call session
  createCallSession: async (mode = 'general') => {
    const response = await fetch(`${API_BASE_URL}/ai/voice-session`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mode }),
    })
    return handleResponse(response)
  },
}

// Home Service
export const homeService = {
  getHomeData: async () => {
    const response = await fetch(`${API_BASE_URL}/home/data`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getVerse: async () => {
    const response = await fetch(`${API_BASE_URL}/home/verse`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getActivity: async () => {
    const response = await fetch(`${API_BASE_URL}/home/activity`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/home/stats`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// Prayer Service
export const prayerService = {
  createPrayer: async (prayerData) => {
    const response = await fetch(`${API_BASE_URL}/prayers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prayerData),
    })
    return handleResponse(response)
  },

  getPrayers: async () => {
    const response = await fetch(`${API_BASE_URL}/prayers`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  deletePrayer: async (prayerId) => {
    const response = await fetch(`${API_BASE_URL}/prayers/${prayerId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// Notes Service
export const notesService = {
  createNote: async (noteData) => {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(noteData),
    })
    return handleResponse(response)
  },

  getNotes: async (sourceType = null) => {
    const url = sourceType 
      ? `${API_BASE_URL}/notes?source_type=${encodeURIComponent(sourceType)}`
      : `${API_BASE_URL}/notes`
    const response = await fetch(url, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  getNote: async (noteId) => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  updateNote: async (noteId, noteData) => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(noteData),
    })
    return handleResponse(response)
  },

  deleteNote: async (noteId) => {
    const response = await fetch(`${API_BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}
