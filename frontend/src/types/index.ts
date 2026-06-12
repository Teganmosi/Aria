// ─── User / Auth ────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  aria_custom_prompt?: string
  aria_personal_context?: string
  aria_voice?: string
  created_at: string
  updated_at?: string
}

export interface AuthResponse {
  access_token: string
  user?: User
  data?: { user: User }
}

// ─── Chat / AI ───────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp?: string
}

export interface AIGenerateResponse {
  content: string
}

// ─── Notes ──────────────────────────────────────────────────────────────────

export type NoteSourceType = 'bible' | 'companion' | 'devotion' | 'general'

export interface Note {
  id: string
  title: string
  content: string
  source_type: NoteSourceType
  source_reference?: string
  tags: string[]
  is_locked: boolean
  created_at: string
  updated_at?: string
}

export interface NoteFormData {
  title: string
  content: string
  source_type: NoteSourceType
  source_reference: string
  tags: string[]
  is_locked: boolean
  password: string
}

// ─── Activity ────────────────────────────────────────────────────────────────

export type ActivityType = 'bible_study' | 'support' | 'chat'

export interface Activity {
  id: string | number
  type: ActivityType
  title: string
  subtitle?: string
  created_at: string
  path: string
}

export interface ActivityResponse {
  activity: Activity[]
}

// ─── Devotion ────────────────────────────────────────────────────────────────

export interface Devotion {
  id: string
  date: string
  day_plan: string
  completed: boolean
  created_at: string
}

// ─── Bible ───────────────────────────────────────────────────────────────────

export interface BibleVerse {
  book: string
  chapter: number
  verse: number
  text: string
  translation?: string
}

export interface BibleSearchResult {
  verses: BibleVerse[]
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardData {
  streak?: number
  total_sessions?: number
  last_activity?: string
  activity?: Activity[]
}

// ─── Zustand Store ───────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
  checkAuth: () => Promise<void>
  login: (email: string, password: string) => Promise<AuthResponse>
  register: (email: string, password: string, fullName: string) => Promise<AuthResponse>
  logout: () => void
  refreshUser: () => Promise<void>
}

// ─── WebSocket ───────────────────────────────────────────────────────────────

export type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error'

export interface WebSocketMessage {
  type: string
  [key: string]: unknown
}
