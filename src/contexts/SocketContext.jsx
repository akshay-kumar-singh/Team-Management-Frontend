import { useEffect, useState } from "react";
import { initSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../hooks/useAuth";
import { SocketContext } from "./socket-context";

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log("Initializing socket for user:", user.uid);
      const newSocket = initSocket(() => user.getIdToken());
      setSocket(newSocket);
    } else {
      console.log("No user, disconnecting socket");
      disconnectSocket();
      setSocket(null);
    }

    return () => {
      disconnectSocket();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
