import { createContext, useContext, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // In-memory & stored authentication state
  // TODO: Handle token securely (cookies/localStorage later)
  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("token");
  });

  const [isNewUser, setIsNewUser] = useState(() => {
    return localStorage.getItem("isNewUser") === "true";
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  /**
   * Log in user with credentials
   * Existing user -> directs to Home
   * @param {{ email: string, password: string }} credentials
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      // TODO: Replace with production auth
      const data = await authService.login(credentials);

      // TODO: Fix token handling properly
      const authToken =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        "mock_token_" + Date.now();

      const authenticatedUser =
        data?.user ||
        data?.data?.user || {
          email: credentials.email,
          username: credentials.email.split("@")[0],
        };

      const userIsNew =
        data?.user?.isNewUser ??
        data?.user?.isFirstLogin ??
        data?.isNewUser ??
        data?.isFirstLogin ??
        (localStorage.getItem("justRegistered") === "true");

      // Store token in state
      setToken(authToken);
      setUser(authenticatedUser);
      setIsAuthenticated(true);
      setIsNewUser(userIsNew);
      localStorage.setItem("isNewUser", userIsNew ? "true" : "false");

      // TODO: Handle token securely (cookies/localStorage later)
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(authenticatedUser));
      if (typeof window !== "undefined") {
        window.__APP_TOKEN__ = authToken;
      }

      return {
        ...data,
        token: authToken,
        user: authenticatedUser,
        isNewUser: userIsNew,
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   * @param {{ username: string, email: string, password: string }} userData
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      return data;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete resume step - sets isNewUser = false
   */
  const completeResume = () => {
    setIsNewUser(false);
    localStorage.setItem("isNewUser", "false");
    localStorage.removeItem("justRegistered");
  };

  /**
   * Log out user
   */
  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setIsNewUser(false);
    localStorage.setItem("isNewUser", "false");
    localStorage.removeItem("justRegistered");
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") {
      window.__APP_TOKEN__ = null;
    }
  };

  const updateIsNewUser = (val) => {
    setIsNewUser(val);
    localStorage.setItem("isNewUser", val ? "true" : "false");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isNewUser,
        loading,
        login,
        register,
        logout,
        completeResume,
        setIsNewUser: updateIsNewUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
