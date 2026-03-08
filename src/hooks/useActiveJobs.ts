import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActiveJob {
  id: string;
  tool_type: string;
  model: string;
  prompt: string;
  status: string;
  progress: number;
  result_url: string | null;
  result_url_temp: string | null;
  credits_used: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  result_metadata: Record<string, any> | null;
}

const POLL_INTERVAL = 5000;

export function useActiveJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ActiveJob[]>([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) {
      setJobs([]);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("generation_jobs")
      .select("id, tool_type, model, prompt, status, progress, result_url, result_url_temp, credits_used, created_at, started_at, completed_at, result_metadata")
      .in("status", ["pending", "processing", "completed", "failed"])
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setJobs(data as ActiveJob[]);
    }
    setLoading(false);
  }, [user]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll only active jobs
  useEffect(() => {
    const hasActive = jobs.some((j) => j.status === "pending" || j.status === "processing");
    
    if (hasActive) {
      pollRef.current = setInterval(fetchJobs, POLL_INTERVAL);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [jobs, fetchJobs]);

  // Also subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("active-jobs")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generation_jobs",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Refetch on any change
          fetchJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchJobs]);

  const dismissJob = useCallback((jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  }, []);

  const activeJobs = jobs.filter((j) => j.status === "pending" || j.status === "processing");
  const recentJobs = jobs.filter((j) => j.status === "completed" || j.status === "failed");

  return { jobs, activeJobs, recentJobs, loading, refetch: fetchJobs, dismissJob };
}
