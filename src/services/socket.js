import { io } from "socket.io-client";

let socket = null;

export const initSocket = (getToken) => {
  if (socket) {
    console.log("Socket already initialized");
    return socket;
  }

  const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    withCredentials: true,
    // Called on every (re)connection attempt so a fresh Firebase ID token
    // is sent in the handshake — the server rejects unauthenticated sockets
    auth: (cb) => {
      Promise.resolve(getToken ? getToken() : null)
        .then((token) => cb({ token }))
        .catch(() => cb({ token: null }));
    },
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log("Socket disconnected and cleared");
  }
};
