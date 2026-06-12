import { useQuery } from '@tanstack/react-query'
import { homeService } from '../services/api'

export const useActivityHistory = (limit = 50) =>
  useQuery({
    queryKey: ['activity', limit],
    queryFn: () => homeService.getActivity(limit),
    staleTime: 1000 * 60 * 2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    select: (data: any) => data?.activity ?? [],
  })
