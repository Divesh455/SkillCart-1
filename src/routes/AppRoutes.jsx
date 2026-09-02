import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "../pages/Landing/LandingPage";
import AuthPage from "../pages/Auth/AuthPage";
import HomePage from "../pages/Home/HomePage";
import JobsPage from "../pages/Jobs/JobsPage";
import ForYouPage from "../pages/ForYou/ForYouPage";
import ResumePage from "../pages/Resume/ResumePage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/login" element={<AuthPage />} />
      

      {/* 
        Protected routes wrapped in ProtectedRoute component.
        Note: Route protection checks inside ProtectedRoute are currently commented out for open access.
      */}
      <Route
        path="/resume"
        element={
          <ProtectedRoute>
            <ResumePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/for-you"
        element={
          <ProtectedRoute>
            <ForYouPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/foryou"
        element={
          <ProtectedRoute>
            <ForYouPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <ForYouPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-jobs"
        element={
          <ProtectedRoute>
            <ForYouPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <Navigate to="/resume" replace />
          </ProtectedRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
