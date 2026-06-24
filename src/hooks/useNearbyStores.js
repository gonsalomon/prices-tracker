import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useNearbyStores(lat, lng) {
  return useQuery({
    queryKey: ["stores", lat, lng],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_nearby_stores", {
        user_lat: lat,
        user_lng: lng,
        radius_meters: 5000,
      });
      console.log("stores data:", data);
      console.log("stores error:", error);
      if (error) throw error;
      return data;
    },
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000,
  });
}
