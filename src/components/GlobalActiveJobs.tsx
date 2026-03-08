import { useAuth } from "@/hooks/useAuth";
import { useActiveJobs } from "@/hooks/useActiveJobs";
import ActiveJobsPanel from "@/components/ActiveJobsPanel";

/**
 * Floating global panel that shows active/recent generation jobs.
 * Rendered in AuthenticatedLayout so it persists across all studio pages.
 */
export default function GlobalActiveJobs() {
  const { user } = useAuth();
  const { activeJobs, recentJobs, dismissJob } = useActiveJobs(user?.id ?? null);

  const hasAny = activeJobs.length > 0 || recentJobs.length > 0;
  if (!hasAny) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[340px] max-h-[60vh] overflow-y-auto scrollbar-thin rounded-xl border border-border/50 bg-background/95 backdrop-blur-md shadow-2xl p-3 space-y-2">
      <ActiveJobsPanel activeJobs={activeJobs} recentJobs={recentJobs} onDismiss={dismissJob} />
    </div>
  );
}
