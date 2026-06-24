import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useSubmitReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ storeId, productId, isAvailable }) => {
      const { data: { session } } = await supabase.auth.getSession()
      const { error } = await supabase
        .from('availability_reports')
        .insert({
          store_id:     storeId,
          product_id:   productId,
          is_available: isAvailable,
          reported_by:  session?.user?.id ?? null,
        })
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports', variables.storeId] })
      queryClient.invalidateQueries({ queryKey: ['availability'] })
    },
  })
}