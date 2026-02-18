import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useCauris = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: balance = 0, isLoading: loading } = useQuery({
    queryKey: ["cauris", user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error || !data) return 0;
      return data.credits;
    },
    enabled: !!user,
    staleTime: 30_000, // 30s avant de refetch
    refetchInterval: 60_000, // refetch toutes les 60s max
  });

  const deduct = useCallback(async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    if (!user) return { success: false, newBalance: 0 };
    const { data, error } = await supabase.rpc("deduct_cauris", {
      p_user_id: user.id,
      p_amount: amount,
    });
    if (error || data === -1) return { success: false, newBalance: balance };
    // Update cache immediately
    queryClient.setQueryData(["cauris", user.id], data);
    return { success: true, newBalance: data };
  }, [user, balance, queryClient]);

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["cauris", user?.id] });
  }, [queryClient, user?.id]);

  return { balance, loading, deduct, refetch };
};
