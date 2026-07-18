import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useSocket } from "./useSocket";

export const useAgent = () => {
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  // Fetch all agent jobs. Background polls pass { silent: true } so the
  // loading state doesn't flip and make the UI flicker every interval.
  const fetchJobs = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const { data } = await api.get("/api/agent/jobs");
      setJobs(data);
    } catch (error) {
      console.error("Error fetching agent jobs:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Fetch a specific job's status
  const fetchJobStatus = useCallback(async (jobId) => {
    try {
      const { data } = await api.get(`/api/agent/status/${jobId}`);
      setActiveJob(data);
      setLogs(data.logs || []);
      return data;
    } catch (error) {
      console.error("Error fetching job status:", error);
    }
  }, []);

  // Trigger agent for a task
  const triggerAgent = useCallback(async (taskId) => {
    try {
      const { data } = await api.post(`/api/agent/trigger/${taskId}`);
      return data;
    } catch (error) {
      console.error("Error triggering agent:", error);
      throw error;
    }
  }, []);

  // Delete an agent job
  const deleteJob = useCallback(async (jobId) => {
    try {
      await api.delete(`/api/agent/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      if (activeJob && activeJob._id === jobId) {
        setActiveJob(null);
        setLogs([]);
      }
    } catch (error) {
      console.error("Error deleting agent job:", error);
      throw error;
    }
  }, [activeJob]);

  // Listen for Socket.IO agent events
  useEffect(() => {
    if (!socket) return;

    const handleAgentLog = (data) => {
      setLogs((prev) => [...prev, data.log]);
      // Update active job status
      if (activeJob && data.jobId === activeJob._id) {
        setActiveJob((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    };

    const handleAgentStatus = (data) => {
      // Update job in the jobs list
      setJobs((prev) =>
        prev.map((j) => (j._id === data.jobId ? { ...j, status: data.status } : j))
      );
      if (activeJob && data.jobId === activeJob._id) {
        setActiveJob((prev) => (prev ? { ...prev, status: data.status } : prev));
      }
    };

    socket.on("agent-log", handleAgentLog);
    socket.on("agent-status", handleAgentStatus);

    return () => {
      socket.off("agent-log", handleAgentLog);
      socket.off("agent-status", handleAgentStatus);
    };
  }, [socket, activeJob]);

  return {
    jobs,
    activeJob,
    logs,
    loading,
    fetchJobs,
    fetchJobStatus,
    triggerAgent,
    deleteJob,
    setActiveJob,
    setLogs,
  };
};
