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
  generation_count: number;
  cauris_spent: number;
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
      .select("id, name, cover_url, created_at, updated_at, generation_count, cauris_spent")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("fetchProjects error:", error);
      setLoading(false);
      return;
    }

    const enriched: Project[] = (data || []).map((p: any) => ({
      ...p,
      generation_count: p.generation_count ?? 0,
      cauris_spent: p.cauris_spent ?? 0,
    }));

    setProjects(enriched);
    setLoading(false);
  }, [user, selectProject]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (name: string) => {
    if (!user) return null;

    // Enforce 10 project limit
    if (projects.length >= 10) {
      toast.error("Limite atteinte : 10 projets maximum par compte");
      return null;
    }

    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: user.id, name: name.trim() || "Sans titre" })
      .select("id, name, cover_url, created_at, updated_at, generation_count, cauris_spent")
      .single();

    if (error) {
      toast.error("Impossible de créer le projet");
      return null;
    }

    const project: Project = { ...(data as any), generation_count: data.generation_count ?? 0, cauris_spent: data.cauris_spent ?? 0 };
    setProjects((prev) => [project, ...prev]);
    selectProject(project.id);
    toast.success(`Projet "${project.name}" créé`);

    // Warn when approaching limit
    if (projects.length === 8) toast.warning("Attention : 8/10 projets utilisés");
    if (projects.length === 9) toast.warning("Attention : 9/10 projets utilisés");

    return project;
  }, [user, selectProject, projects.length]);

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
      // DELETE generations linked to this project (not just unlink)
      const [deleteJobs, deleteGen] = await Promise.all([
        supabase.from("generation_jobs").delete().eq("project_id", id),
        supabase.from("generations").delete().eq("project_id", id),
      ]);

      if (deleteJobs.error) console.error("Delete jobs error:", deleteJobs.error);
      if (deleteGen.error) console.error("Delete generations error:", deleteGen.error);

      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        console.error("Delete project error:", error);
        toast.error("Erreur lors de la suppression du projet");
        return;
      }

      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedProjectId === id) selectProject(null);
      toast.success("Projet et générations supprimés (cauris non remboursés)");
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
