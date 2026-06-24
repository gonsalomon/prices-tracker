import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useStoreAvailability(productId, storeIds) {
  return useQuery({
    queryKey: ['availability', productId, storeIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('current_availability')
        .select('store_id, is_available, is_stale')
        .eq('product_id', productId)
        .in('store_id', storeIds)
      if (error) throw error
      return Object.fromEntries(data.map(r => [r.store_id, r]))
    },
    enabled: !!productId && storeIds.length > 0,
    staleTime: 3 * 60 * 1000,
  })
}