import { useQuery } from '@tanstack/react-query'
import { homeService } from '../services/api'

export const useHomeData = () =>
  useQuery({
    queryKey: ['homeData'],
    queryFn: () => homeService.getHomeData(),
    staleTime: 1000 * 60 * 5,
  })
