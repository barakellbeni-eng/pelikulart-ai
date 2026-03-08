import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveJob {
  id: string;
  tool_type: string;
  model: string;
  prompt: string;
  status: string;
  progress: number;
  result_url: string | null;
  result_url_original: string | null;
  result_url_temp: string | null;
  credits_used: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  result_metadata: Record<string, any> | null;
}

const POLL_INTERVAL = 5000;

// ── Singleton store ──
let jobs: ActiveJob[] = [];
let loading = true;
let currentUserId: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let realtimeChannel: any = null;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return jobs;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

async function fetchJobs() {
  if (!currentUserId) {
    jobs = [];
    loading = false;
    notify();
    return;
  }

  const { data, error } = await supabase
    .from("generation_jobs")
    .select("*")
    .in("status", ["pending", "processing", "completed", "failed"])
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!error && data) {
    jobs = data as ActiveJob[];
  }
  loading = false;
  notify();
}

function startPolling() {
  stopPolling();
  const hasActive = jobs.some((j) => j.status === "pending" || j.status === "processing");
  if (hasActive) {
    pollTimer = setInterval(fetchJobs, POLL_INTERVAL);
  }
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function setupRealtime(userId: string) {
  cleanupRealtime();
  realtimeChannel = supabase
    .channel("active-jobs-global")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "generation_jobs",
        filter: `user_id=eq.${userId}`,
      },
      () => {
        fetchJobs();
      }
    )
    .subscribe();
}

function cleanupRealtime() {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
}

function initForUser(userId: string) {
  if (currentUserId === userId) return;
  currentUserId = userId;
  loading = true;
  notify();
  fetchJobs().then(() => {
    startPolling();
  });
  setupRealtime(userId);
}

function clearForLogout() {
  currentUserId = null;
  jobs = [];
  loading = false;
  stopPolling();
  cleanupRealtime();
  notify();
}

// Re-evaluate polling whenever jobs change
let prevJobsRef = jobs;

/**
 * Hook that provides persistent active jobs across navigation.
 * Uses a singleton store so state survives component unmounts.
 */
export function useActiveJobs(userId?: string | null) {
  const currentJobs = useSyncExternalStore(subscribe, getSnapshot);

  // Init/cleanup based on userId
  useEffect(() => {
    if (userId) {
      initForUser(userId);
    } else if (userId === null) {
      clearForLogout();
    }
  }, [userId]);

  // Re-evaluate polling when jobs change
  useEffect(() => {
    if (currentJobs !== prevJobsRef) {
      prevJobsRef = currentJobs;
      startPolling();
    }
  }, [currentJobs]);

  const dismissJob = useCallback((jobId: string) => {
    jobs = jobs.filter((j) => j.id !== jobId);
    notify();
  }, []);

  const activeJobs = currentJobs.filter((j) => j.status === "pending" || j.status === "processing");
  const recentJobs = currentJobs.filter((j) => j.status === "completed" || j.status === "failed");

  return { jobs: currentJobs, activeJobs, recentJobs, loading, refetch: fetchJobs, dismissJob };
}
