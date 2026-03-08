import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Project {
  id: string;
  name: string;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
  /** Client-side count – populated after fetch */
  generation_count?: number;
}

// Persist selected project id across navigation
let _selectedProjectId: string | null = null;
const _listeners = new Set<() => void>();
function setGlobalProjectId(id: string | null) {
  _selectedProjectId = id;
  _listeners.forEach((l) => l());
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, _setLocal] = useState<string | null>(_selectedProjectId);

  // Sync global → local
  useEffect(() => {
    const handler = () => _setLocal(_selectedProjectId);
    _listeners.add(handler);
    return () => { _listeners.delete(handler); };
  }, []);

  const selectProject = useCallback((id: string | null) => {
    setGlobalProjectId(id);
  }, []);

  const fetchProjects = useCallback(async () => {
    if (!user) { setProjects([]); setLoading(false); return; }
    setLoading(true);

    const { data, error } = await supabase
      .from("projects")
      .select("id, name, cover_url, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("fetchProjects error:", error);
      setLoading(false);
      return;
    }

    // Auto-create "Projet 1" for new users with no projects
    if (!data || data.length === 0) {
      const { data: newProject, error: createErr } = await supabase
        .from("projects")
        .insert({ user_id: user.id, name: "Projet 1" })
        .select("id, name, cover_url, created_at, updated_at")
        .single();

      if (!createErr && newProject) {
        const p: Project = { ...(newProject as any), generation_count: 0 };
        setProjects([p]);
        selectProject(p.id);
      }
      setLoading(false);
      return;
    }

    // Get counts from generation_jobs per project (only completed, non-deleted)
    const { data: counts } = await supabase
      .from("generation_jobs")
      .select("project_id")
      .eq("status", "completed")
      .is("deleted_at", null)
      .not("project_id", "is", null);

    const countMap = new Map<string, number>();
    if (counts) {
      for (const row of counts) {
        const pid = (row as any).project_id as string;
        countMap.set(pid, (countMap.get(pid) || 0) + 1);
      }
    }

    const enriched: Project[] = (data || []).map((p: any) => ({
      ...p,
      generation_count: countMap.get(p.id) || 0,
    }));

    setProjects(enriched);
    setLoading(false);
  }, [user, selectProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (name: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: name.trim() || "Sans titre" })
      .select("id, name, cover_url, created_at, updated_at")
      .single();

    if (error) {
      toast.error("Impossible de créer le projet");
      return null;
    }

    const project: Project = { ...(data as any), generation_count: 0 };
    setProjects((prev) => [project, ...prev]);
    selectProject(project.id);
    toast.success(`Projet "${project.name}" créé`);
    return project;
  }, [user, selectProject]);

  const renameProject = useCallback(async (id: string, newName: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ name: newName.trim(), updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast.error("Erreur lors du renommage");
      return;
    }

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName.trim() } : p))
    );
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    if (!user) return;

    try {
      // Unlink generations first (set project_id to null)
      const [unlinkJobs, unlinkGen] = await Promise.all([
        supabase.from("generation_jobs").update({ project_id: null }).eq("project_id", id),
        supabase.from("generations").update({ project_id: null }).eq("project_id", id),
      ]);

      if (unlinkJobs.error) console.error("Unlink jobs error:", unlinkJobs.error);
      if (unlinkGen.error) console.error("Unlink generations error:", unlinkGen.error);

      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        console.error("Delete project error:", error);
        toast.error("Erreur lors de la suppression du projet");
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) selectProject(null);
      toast.success("Projet supprimé");
    } catch (e) {
      console.error("deleteProject error:", e);
      toast.error("Erreur lors de la suppression");
    }
  }, [user, selectedProjectId, selectProject]);

  const updateCover = useCallback(async (projectId: string, coverUrl: string) => {
    await supabase
      .from("projects")
      .update({ cover_url: coverUrl, updated_at: new Date().toISOString() })
      .eq("id", projectId);

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, cover_url: coverUrl } : p))
    );
  }, []);

  return {
    projects,
    loading,
    selectedProjectId,
    selectProject,
    createProject,
    renameProject,
    deleteProject,
    updateCover,
    refetch: fetchProjects,
  };
}
