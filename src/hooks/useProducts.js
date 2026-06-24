import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .order('name')
      if (error) throw error
      return data
    },
    staleTime: 10 * 60 * 1000,
  })
}