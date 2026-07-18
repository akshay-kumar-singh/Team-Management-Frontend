import { useState, useEffect } from "react";
import api from "../services/api";
import { useSocket } from "./useSocket";
import toast from "react-hot-toast";

export const useTasks = (projectId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  const fetchTasks = async () => {
    if (!projectId) {
      setTasks([]);
      setLoading(false);
      return;
    }
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
      setTasks((prev) => [...prev, data]);
      toast.success("Task created successfully");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateTask = async (id, taskData) => {
    // Optimistic UI Update
    const previousTasks = [...tasks];
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, ...taskData } : t)));

    try {
      const { data } = await api.put(`/api/tasks/${id}`, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      toast.success("Task updated successfully");
      return data;
    } catch (error) {
      setTasks(previousTasks); // Revert on error
      toast.error(error.message);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;
    const handleTaskUpdated = ({ taskId, status, prLink }) => {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status, prLink: prLink || t.prLink } : t
        )
      );
    };
    socket.on("task-updated", handleTaskUpdated);
    return () => socket.off("task-updated", handleTaskUpdated);
  }, [socket]);

  return { tasks, loading, createTask, updateTask, deleteTask, fetchTasks };
};
