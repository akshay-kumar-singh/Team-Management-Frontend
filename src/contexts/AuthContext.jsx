import { createContext, useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          await firebaseUser.getIdToken(true);

          const { data } = await api.get("/api/users/me");
          setUserData(data);
        } catch (error) {
          if (error.response?.status === 404) {
            console.log("User not found in database");
          }
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const register = async (email, password, name, organizationName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Firebase user created:", result.user.uid);

      const token = await result.user.getIdToken();
      console.log("Token obtained");

      const { data } = await api.post("/api/users", {
        name,
        organizationName,
        email,
      });
      console.log("User created in database:", data);

      setUserData(data);

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const registerFromInvite = async (email, password, name, token) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      // Ensure firebase provisions before hitting our DB
      await result.user.getIdToken(); 

      const { data } = await api.post("/api/users/accept-invite", {
        name,
        email,
        token
      });

      setUserData(data);
      return result;
    } catch (error) {
      console.error("Invite Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, loading, login, register, registerFromInvite, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
