import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../common/Loader";

export const SuperadminRoute = ({ children }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" />;
  if (userData?.role !== "SUPERADMIN") return <Navigate to="/dashboard" />;

  return children;
};
