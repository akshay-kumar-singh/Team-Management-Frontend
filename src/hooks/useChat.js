import { useState, useEffect } from "react";
import api from "../services/api";
import { useSocket } from "./useSocket";
import toast from "react-hot-toast";

const PAGE_SIZE = 50;

export const useChat = (teamId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loadingEarlier, setLoadingEarlier] = useState(false);
  const { socket } = useSocket();

  const actualTeamId =
    typeof teamId === "object" && teamId?._id ? teamId._id : teamId;

  const fetchMessages = async () => {
    if (!actualTeamId) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get(`/api/messages?limit=${PAGE_SIZE}`);
      setMessages(data);
      setHasMore(data.length === PAGE_SIZE); // a full page means there may be older ones
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // "Load earlier" — fetch the page immediately older than the oldest we hold
  const loadEarlier = async () => {
    if (!messages.length || loadingEarlier) return;
    setLoadingEarlier(true);
    try {
      const oldestId = messages[0]._id;
      const { data } = await api.get(`/api/messages?limit=${PAGE_SIZE}&before=${oldestId}`);
      if (data.length) setMessages((prev) => [...data, ...prev]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      console.error("Error loading earlier messages:", error);
    } finally {
      setLoadingEarlier(false);
    }
  };

  const sendMessage = async (content) => {
    if (!actualTeamId) {
      toast.error("No team selected");
      return;
    }

    try {
      console.log("Sending message to team:", actualTeamId);
      const { data } = await api.post("/api/messages", {
        content,
        teamId: actualTeamId,
      });

      console.log("Message created:", data);

      if (socket && socket.connected) {
        console.log("Emitting message via socket");
        socket.emit("send-message", data);
      } else {
        console.warn("Socket not connected, adding message locally");
        setMessages((prev) => [...prev, data]);
      }

      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.message);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [actualTeamId]);

  useEffect(() => {
    if (socket && actualTeamId) {
      console.log("Setting up socket listeners for team:", actualTeamId);

      socket.emit("join-team", actualTeamId);

      socket.on("team-joined", ({ teamId, socketId }) => {
        console.log("✅ Joined team room:", teamId, "Socket:", socketId);
      });

      socket.on("new-message", (message) => {
        console.log("📨 New message received:", message);
        setMessages((prev) => {
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          return [...prev, message];
        });
      });

      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("new-message");
        socket.off("team-joined");
      };
    }
  }, [socket, actualTeamId]);

  return { messages, loading, sendMessage, fetchMessages, hasMore, loadEarlier, loadingEarlier };
};
