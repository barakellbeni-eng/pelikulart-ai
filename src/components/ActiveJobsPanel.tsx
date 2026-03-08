import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Image, Video, Music, X, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import type { ActiveJob } from "@/hooks/useActiveJobs";

interface ActiveJobsPanelProps {
  activeJobs: ActiveJob[];
  recentJobs: ActiveJob[];
  onDismiss: (jobId: string) => void;
}

const toolIcons = {
  image: Image,
  video: Video,
  audio: Music
};

function JobCard({ job, onDismiss }: {job: ActiveJob;onDismiss: (id: string) => void;}) {
  const isActive = job.status === "pending" || job.status === "processing";
  const isCompleted = job.status === "completed";
  const isFailed = job.status === "failed";
  const Icon = toolIcons[job.tool_type as keyof typeof toolIcons] || Image;

  // For completed jobs, show result_url_temp first, then result_url when available
  const displayUrl = job.result_url || job.result_url_temp;

  // Animated progress for active jobs
  const [displayProgress, setDisplayProgress] = useState(job.progress);
  useEffect(() => {
    if (isActive) {
      // Smooth fake progress when real progress is 0
      if (job.progress === 0) {
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = (Date.now() - start) / 1000;
          const fakeP = Math.min(elapsed * 2, 30); // caps at 30%
          setDisplayProgress(fakeP);
        }, 200);
        return () => clearInterval(interval);
      }
      setDisplayProgress(job.progress);
    } else {
      setDisplayProgress(isCompleted ? 100 : 0);
    }
  }, [job.progress, job.status, isActive, isCompleted]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className={`relative rounded-xl border overflow-hidden ${
      isActive ?
      "border-primary/30 bg-primary/5" :
      isCompleted ?
      "border-emerald-500/20 bg-emerald-500/5" :
      "border-destructive/20 bg-destructive/5"}`
      }>
      
      {/* Progress bar */}
      {isActive &&
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-muted/20">
          <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${displayProgress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }} />
        
        </div>
      }

      <div className="p-3 flex items-start gap-3">
        {/* Icon */}
        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
        isActive ? "bg-primary/20" : isCompleted ? "bg-emerald-500/20" : "bg-destructive/20"}`
        }>
          {isActive ?
          <Loader2 className="w-4 h-4 text-primary animate-spin" /> :
          isCompleted ?
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :

          <XCircle className="w-4 h-4 text-destructive" />
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {job.tool_type}
            </span>
            <span className="text-[9px] text-muted-foreground/60">·</span>
            <span className="text-[9px] text-muted-foreground/60 truncate">{job.model}</span>
          </div>
          <p className="text-xs text-foreground/80 line-clamp-1">{job.prompt}</p>
          
          {isActive &&
          <p className="text-[10px] text-primary mt-1 font-medium">
              {job.status === "pending" ? "En attente..." : `En cours ${Math.round(displayProgress)}%`}
            </p>
          }

          {isFailed &&
          <div className="mt-1.5 space-y-0.5">
              <p className="text-[10px] text-destructive font-medium">Échec de la génération</p>
              <p className="text-[10px] text-muted-foreground">
                <RefreshCw className="w-2.5 h-2.5 inline mr-0.5" />
                {job.credits_used} cauris remboursés
              </p>
            </div>
          }

          {isCompleted && displayUrl &&
          <div className="mt-2 rounded-lg overflow-hidden max-w-[200px]">
              {job.tool_type === "video" ?
            <video src={displayUrl} controls className="w-full rounded-lg" /> :
            job.tool_type === "audio" ?
            <div>
              {(job.result_metadata as any)?.thumbnail_url && (
                <img src={(job.result_metadata as any).thumbnail_url} alt="" className="w-full rounded-lg mb-1" loading="lazy" />
              )}
              <audio src={displayUrl} controls className="w-full" />
            </div> :
            <img src={displayUrl} alt="" className="w-full rounded-lg" loading="lazy" />
            }
              {job.result_url_temp && !job.result_url &&
            <p className="text-[9px] text-muted-foreground/50 mt-0.5 italic">Sauvegarde en cours...</p>
            }
            </div>
          }
        </div>

        {/* Dismiss */}
        {!isActive &&
        <button
          onClick={() => onDismiss(job.id)}
          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/30 transition-colors">
          
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        }
      </div>
    </motion.div>);

}

export default function ActiveJobsPanel({ activeJobs, recentJobs, onDismiss }: ActiveJobsPanelProps) {
  const [showRecent, setShowRecent] = useState(false);
  const hasAny = activeJobs.length > 0 || recentJobs.length > 0;

  if (!hasAny) return null;

  return (
    <div className="space-y-2">
      {/* Active jobs */}
      <AnimatePresence mode="popLayout">
        {activeJobs.map((job) =>
        <JobCard key={job.id} job={job} onDismiss={onDismiss} />
        )}
      </AnimatePresence>

      {/* Recent completed/failed toggle */}
      {recentJobs.length > 0























      }
    </div>);

}