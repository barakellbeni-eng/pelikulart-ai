import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useCauris = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); setLoading(false); return; }
    const { data, error } = await supabase
      .from("profiles")
      .select("credits")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error && data) setBalance(data.credits);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const deduct = async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    if (!user) return { success: false, newBalance: 0 };
    const { data, error } = await supabase.rpc("deduct_cauris", {
      p_user_id: user.id,
      p_amount: amount,
    });
    if (error || data === -1) return { success: false, newBalance: balance };
    setBalance(data);
    return { success: true, newBalance: data };
  };

  return { balance, loading, deduct, refetch: fetchBalance };
};
