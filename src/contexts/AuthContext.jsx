import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";
import api from "../services/api";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
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

  // Re-fetch /me (populated with the org's status/plan) — used by the
  // approval gate's "Check status" and after registration
  const refreshUser = async () => {
    try {
      const { data } = await api.get("/api/users/me");
      setUserData(data);
      return data;
    } catch {
      return null;
    }
  };

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

      // Ensure the ID token is provisioned before hitting our API
      await result.user.getIdToken();

      const { data } = await api.post("/api/users", {
        name,
        organizationName,
        email,
      });
      console.log("User created in database:", data);

      // The create response has an unpopulated teamId — fetch /me so the
      // approval gate can read the org's status right away
      await refreshUser();

      return result;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const registerFromInvite = async (email, password, name, token) => {
    try {
      let result;
      try {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        // A previous join attempt may have already created the Firebase
        // account — sign in with the given password and continue
        if (error.code === "auth/email-already-in-use") {
          result = await signInWithEmailAndPassword(auth, email, password);
        } else {
          throw error;
        }
      }
      // Ensure firebase provisions before hitting our DB
      await result.user.getIdToken();

      await api.post("/api/users/accept-invite", {
        name,
        email,
        token
      });

      await refreshUser();
      return result;
    } catch (error) {
      console.error("Invite Registration error:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Toggle a project/task favourite and reflect it in userData immediately
  const toggleStar = async (type, id) => {
    const { data } = await api.post("/api/users/star", { type, id });
    setUserData((u) =>
      u ? { ...u, starredProjects: data.starredProjects, starredTasks: data.starredTasks } : u
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        register,
        registerFromInvite,
        logout,
        refreshUser,
        toggleStar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
