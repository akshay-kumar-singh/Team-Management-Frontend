import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

/**
 * Backlog-planning data for a project: every sprint plus every board issue
 * (fetched with all=true so it isn't sprint-filtered). The page groups the
 * issues by `sprintId` (null = backlog) itself.
 */
export const useSprints = (projectId) => {
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!projectId) {
      setSprints([]);
      setTasks([]);
      setLoading(false);
      return;
    }
    try {
      const [sprintRes, taskRes] = await Promise.all([
        api.get(`/api/sprints?projectId=${projectId}`),
        api.get(`/api/tasks?projectId=${projectId}&all=true`),
      ]);
      setSprints(sprintRes.data);
      setTasks(taskRes.data);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createSprint = async () => {
    try {
      await api.post("/api/sprints", { projectId });
      toast.success("Sprint created");
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const updateSprint = async (id, data) => {
    try {
      await api.patch(`/api/sprints/${id}`, data);
      fetchAll();
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };

  const startSprint = async (id, data) => {
    try {
      await api.post(`/api/sprints/${id}/start`, data);
      toast.success("Sprint started");
      fetchAll();
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };

  const completeSprint = async (id, data) => {
    try {
      const res = await api.post(`/api/sprints/${id}/complete`, data);
      toast.success("Sprint completed");
      fetchAll();
      return res.data;
    } catch (e) {
      toast.error(e.message);
      throw e;
    }
  };

  const deleteSprint = async (id) => {
    try {
      await api.delete(`/api/sprints/${id}`);
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    }
  };

  // Assign issues to a container (sprint id, or null for backlog) + set rank
  const moveTasks = async (sprintId, orderedIds) => {
    const previous = tasks;
    setTasks((prev) =>
      prev.map((t) => {
        const idx = orderedIds.indexOf(t._id);
        return idx === -1 ? t : { ...t, sprintId: sprintId || null, backlogOrder: idx };
      })
    );
    try {
      await api.patch("/api/sprints/reorder", { projectId, sprintId: sprintId || null, orderedIds });
    } catch (e) {
      setTasks(previous);
      toast.error(e.message);
    }
  };

  const quickAdd = async (title, sprintId) => {
    try {
      await api.post("/api/tasks", { title, projectId, sprintId: sprintId || null });
      fetchAll();
    } catch (e) {
      toast.error(e.message);
    }
  };

  return {
    sprints,
    tasks,
    loading,
    fetchAll,
    createSprint,
    updateSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    moveTasks,
    quickAdd,
  };
};
