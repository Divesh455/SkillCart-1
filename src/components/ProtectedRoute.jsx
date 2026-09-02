import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute component for route protection and onboarding flow control.
 *
 * NOTE: Route protection logic is COMMENTED OUT below to allow open access.
 * Uncomment the logic block below to re-enable strict route authentication.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, resumeId } = useAuth();
  const location = useLocation();

  // 1. Unauthenticated check
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check valid resumeId from user object, context state, or localStorage
  const currentResumeId =
    user?.resumeId ||
    user?.resume_id ||
    user?.res_id ||
    user?.Rid ||
    user?.rid ||
    resumeId ||
    localStorage.getItem("res_id") ||
    localStorage.getItem("resume_id");

  const hasValidResumeId = Boolean(
    currentResumeId &&
    currentResumeId !== "null" &&
    currentResumeId !== "undefined" &&
    String(currentResumeId).trim() !== ""
  );

  // 2. Authenticated but NO valid resumeId -> force redirect to /resume if attempting to visit any other route
  if (!hasValidResumeId && location.pathname !== "/resume") {
    return <Navigate to="/resume" replace />;
  }

  // 3. Authenticated AND HAS a valid resumeId -> if visiting /resume, redirect to /home
  if (hasValidResumeId && location.pathname === "/resume") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
