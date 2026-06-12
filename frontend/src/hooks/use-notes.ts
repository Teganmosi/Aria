import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesService } from '../services/api'

export const useNotes = () =>
  useQuery({
    queryKey: ['notes'],
    queryFn: () => notesService.getNotes(),
    staleTime: 1000 * 60,
  })

export const useCreateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: (data: any) => notesService.createNote(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export const useUpdateNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      notesService.updateNote(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}

export const useDeleteNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => notesService.deleteNote(id),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const previousNotes = queryClient.getQueryData<any[]>(['notes'])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      queryClient.setQueryData<any[]>(['notes'], (old) =>
        old?.filter((n) => n.id !== noteId) ?? []
      )
      return { previousNotes }
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(['notes'], context.previousNotes)
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  })
}
