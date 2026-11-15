import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { canAccessModule } from "../../config/permissions";

export default function ProtectedRoute({ children, module }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (module && !canAccessModule(user.role, module)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
