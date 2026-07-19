import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../common/Loader";
import { OrgGate } from "../../pages/OrgGate";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <Loader />;

  if (!user) return <Navigate to="/login" />;

  // Platform superadmins live in the admin console, not the org app
  if (userData?.role === "SUPERADMIN") return <Navigate to="/admin" />;

  // Org not approved (or declined) → gate screen instead of the app
  const orgStatus = userData?.teamId?.status;
  if (orgStatus === "pending" || orgStatus === "rejected") return <OrgGate />;

  if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};
