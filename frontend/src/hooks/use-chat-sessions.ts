import { useQuery } from '@tanstack/react-query'
import { aiChatService } from '../services/api'

export const useChatSessions = () =>
  useQuery({
    queryKey: ['chatSessions'],
    queryFn: () => aiChatService.getSessions(),
    staleTime: 1000 * 30,
  })
