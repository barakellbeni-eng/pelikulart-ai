import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Shared cache across all useCauris instances
let cachedBalance: number | null = null;
let lastFetchTime = 0;
const STALE_TIME = 30_000; // 30s
const listeners = new Set<(balance: number) => void>();

function notifyListeners(balance: number) {
  cachedBalance = balance;
  lastFetchTime = Date.now();
  listeners.forEach((fn) => fn(balance));
}

export const useCauris = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(cachedBalance ?? 0);
  const [loading, setLoading] = useState(cachedBalance === null);
  const fetchingRef = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!user) { setBalance(0); setLoading(false); return; }
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("credits")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!error && data) {
        notifyListeners(data.credits);
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Subscribe to shared cache updates
    const listener = (b: number) => setBalance(b);
    listeners.add(listener);

    // Only fetch if stale
    const isStale = Date.now() - lastFetchTime > STALE_TIME;
    if (cachedBalance !== null && !isStale) {
      setBalance(cachedBalance);
      setLoading(false);
    } else {
      fetchBalance();
    }

    return () => { listeners.delete(listener); };
  }, [fetchBalance]);

  const deduct = useCallback(async (amount: number): Promise<{ success: boolean; newBalance: number }> => {
    if (!user) return { success: false, newBalance: 0 };
    const { data, error } = await supabase.rpc("deduct_cauris", {
      p_user_id: user.id,
      p_amount: amount,
    });
    if (error || data === -1) return { success: false, newBalance: balance };
    notifyListeners(data);
    return { success: true, newBalance: data };
  }, [user, balance]);

  const refetch = useCallback(() => {
    lastFetchTime = 0; // Force stale
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, deduct, refetch };
};
