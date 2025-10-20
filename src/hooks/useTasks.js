import { useState, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

export const useTasks = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!projectId) return;
    try {
      const { data } = await api.get(`/api/tasks?projectId=${projectId}`);
      setTasks(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const { data } = await api.post("/api/tasks", { ...taskData, projectId });
      setTasks([...tasks, data]);
      toast.success("Task created successfully");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const { data } = await api.put(`/api/tasks/${id}`, taskData);
      setTasks(tasks.map((t) => (t._id === id ? data : t)));
      toast.success("Task updated successfully");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  return { tasks, loading, createTask, updateTask, deleteTask, fetchTasks };
};
