/**
 * Global generation store that persists across navigation.
 * Uses a singleton pattern so generation state survives component unmounts.
 */

type GenerationType = "image" | "video" | "audio";

interface GenerationJob {
  id: string;
  type: GenerationType;
  prompt: string;
  status: "pending" | "done" | "error";
  numImages?: number;
  error?: string;
}

type Listener = () => void;

let currentJob: GenerationJob | null = null;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function getGenerationJob(): GenerationJob | null {
  return currentJob;
}

export function startGeneration(type: GenerationType, prompt: string, numImages?: number): string {
  const id = `gen-${Date.now()}`;
  currentJob = { id, type, prompt, status: "pending", numImages };
  notify();
  return id;
}

export function completeGeneration() {
  if (currentJob) {
    currentJob = { ...currentJob, status: "done" };
    // Clear after a short delay so UI can react
    setTimeout(() => {
      currentJob = null;
      notify();
    }, 300);
    notify();
  }
}

export function failGeneration(error?: string) {
  if (currentJob) {
    currentJob = { ...currentJob, status: "error", error };
    // Clear after a delay
    setTimeout(() => {
      currentJob = null;
      notify();
    }, 300);
    notify();
  }
}

export function subscribeGeneration(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
