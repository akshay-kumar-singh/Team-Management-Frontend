import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

 const fetchProjects = async () => {
  try {
    const { data } = await api.get("/api/projects");

    // For each project, fetch tasks and compute status + progress
    const projectsWithStatus = await Promise.all(
      data.map(async (project) => {
        try {
          // all=true → count every issue, not just the active sprint / backlog
          const taskRes = await api.get(`/api/tasks?projectId=${project._id}&all=true`);
          const tasks = taskRes.data;
          const total = tasks.length;
          // "Done" is the project's last board column (custom-column aware)
          const doneId = project.columns?.length
            ? project.columns[project.columns.length - 1].id
            : "done";
          const doneTasks = tasks.filter((t) => t.status === doneId).length;

          let status = "Active";
          if (total > 0 && doneTasks === total) status = "Completed";

          return { ...project, total, doneTasks, status };
        } catch {
          return { ...project, total: 0, doneTasks: 0, status: "Active" };
        }
      })
    );

    setProjects(projectsWithStatus);
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};

  const createProject = async (projectData) => {
    try {
      const { data } = await api.post("/api/projects", projectData);
      // New project has 0 tasks so we add default computed fields
      const newProject = { ...data, total: 0, doneTasks: 0, status: "Active" };
      setProjects([...projects, newProject]);
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
