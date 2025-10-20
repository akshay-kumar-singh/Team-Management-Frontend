import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/api/projects");
      setProjects(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    try {
      const { data } = await api.post("/api/projects", projectData);
      setProjects([...projects, data]);
      toast.success("Project created successfully");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const { data } = await api.put(`/api/projects/${id}`, projectData);
      setProjects(projects.map((p) => (p._id === id ? data : p)));
      toast.success("Project updated successfully");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const deleteProject = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    fetchProjects,
  };
};
