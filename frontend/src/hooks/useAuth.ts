import { useAuthStore } from '../store/auth-store'

// Named export — supports: import { useAuth } from '../hooks/useAuth'
export const useAuth = useAuthStore

// Default export — supports: import useAuth from '../hooks/useAuth'
export default useAuthStore
