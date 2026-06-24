import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStoreReports(storeId) {
  return useQuery({
    queryKey: ['reports', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_reports')
        .select('id, is_available, reported_at, products(name)')
        .eq('store_id', storeId)
        .order('reported_at', { ascending: false })
        .limit(5)
      if (error) throw error
      return data
    },
    enabled: !!storeId,
    staleTime: 60 * 1000,
  })
}