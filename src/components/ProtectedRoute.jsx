import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute component for route protection and onboarding flow control.
 *
 * NOTE: Route protection logic is COMMENTED OUT below to allow open access.
 * Uncomment the logic block below to re-enable strict route authentication.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isNewUser } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated check
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // 2. First-time registered user MUST go to Resume Page
  if (isNewUser && location.pathname !== "/resume") {
    return <Navigate to="/resume" replace />;
  }

  // 3. User should NEVER manually access "/resume" after completion
  if (!isNewUser && location.pathname === "/resume") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
