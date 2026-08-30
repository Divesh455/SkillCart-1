import {
  createContext,
  useContext,
  useState,
} from "react";

import authService from "../services/authService";
import { extractRidFromResponse } from "../services/resumeService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // ============================================================
  // INITIAL TOKEN
  // ============================================================

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || null;
  });

  // ============================================================
  // AUTHENTICATION STATE
  // ============================================================

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      return !!localStorage.getItem("token");
    });

  // ============================================================
  // NEW USER
  // ============================================================

  const [isNewUser, setIsNewUser] =
    useState(() => {
      return (
        localStorage.getItem("isNewUser") ===
        "true"
      );
    });

  // ============================================================
  // USER
  // ============================================================

  const [user, setUser] = useState(() => {
    const savedUser =
      localStorage.getItem("user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  // ============================================================
  // RESUME ID
  // Ayush sends resume ID as "Rid"
  // ============================================================

  const [resumeId, setResumeId] = useState(() => {
    return (
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      null
    );
  });

  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(false);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (credentials) => {

    setLoading(true);

    try {

      const data =
        await authService.login(
          credentials
        );

      console.log(
        "LOGIN RESPONSE:",
        data
      );

      // ========================================================
      // GET REAL TOKEN
      // ========================================================

      const authToken =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken;

      // ========================================================
      // NEVER CREATE FAKE TOKEN
      // ========================================================

      if (
        !authToken ||
        typeof authToken !== "string"
      ) {

        console.error(
          "LOGIN TOKEN NOT FOUND:",
          data
        );

        throw new Error(
          "Login successful but authentication token was not received from the server."
        );
      }

      // ========================================================
      // GET USER
      // ========================================================

      const authenticatedUser =
        data?.user ||
        data?.data?.user ||
        null;

      // ========================================================
      // GET RESUME ID
      //
      // Ayush's AuthResponse:
      //
      // token
      // message
      // Rid
      //
      // ========================================================

      const existingStoredRid =
        localStorage.getItem("res_id") ||
        localStorage.getItem("resume_id") ||
        null;

      const resumeIdFromLogin =
        extractRidFromResponse(data) ||
        data?.Rid ||
        data?.rid ||
        data?.res_id ||
        data?.resumeId ||
        data?.user?.Rid ||
        data?.user?.rid ||
        data?.user?.res_id ||
        data?.user?.resume_id ||
        data?.data?.Rid ||
        data?.data?.rid ||
        data?.data?.res_id ||
        data?.data?.resumeId ||
        data?.data?.user?.Rid ||
        data?.data?.user?.rid ||
        data?.data?.user?.res_id ||
        data?.data?.user?.resume_id ||
        existingStoredRid ||
        null;

      console.log(
        "RESUME ID FROM LOGIN:",
        resumeIdFromLogin
      );

      // ========================================================
      // NEW USER STATUS
      // ========================================================

      const userIsNew =
        data?.user?.isNewUser ??
        data?.user?.isFirstLogin ??
        data?.data?.user?.isNewUser ??
        data?.data?.user?.isFirstLogin ??
        data?.isNewUser ??
        data?.isFirstLogin ??
        (
          localStorage.getItem(
            "justRegistered"
          ) === "true"
        );

      // ========================================================
      // SAVE TO REACT STATE
      // ========================================================

      setToken(authToken);

      setUser(authenticatedUser);

      setIsAuthenticated(true);

      setIsNewUser(userIsNew);

      setResumeId(
        resumeIdFromLogin
      );

      // ========================================================
      // SAVE TOKEN
      // ========================================================

      localStorage.setItem(
        "token",
        authToken
      );

      // ========================================================
      // SAVE USER
      // ========================================================

      if (authenticatedUser) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            authenticatedUser
          )
        );

      } else {

        localStorage.removeItem(
          "user"
        );
      }

      // ========================================================
      // SAVE NEW USER STATUS
      // ========================================================

      localStorage.setItem(
        "isNewUser",
        userIsNew
          ? "true"
          : "false"
      );

      // ========================================================
      // SAVE RESUME ID
      // ========================================================

      if (resumeIdFromLogin) {

        localStorage.setItem(
          "res_id",
          String(
            resumeIdFromLogin
          )
        );

        localStorage.setItem(
          "resume_id",
          String(
            resumeIdFromLogin
          )
        );

      } else {

        localStorage.removeItem(
          "res_id"
        );

        localStorage.removeItem(
          "resume_id"
        );
      }

      // ========================================================
      // OPTIONAL GLOBAL TOKEN
      // ========================================================

      if (
        typeof window !== "undefined"
      ) {

        window.__APP_TOKEN__ =
          authToken;
      }

      // ========================================================
      // RETURN LOGIN DATA
      // ========================================================

      return {
        ...data,

        token: authToken,

        user: authenticatedUser,

        isNewUser: userIsNew,

        res_id:
          resumeIdFromLogin,
      };

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (
    userData
  ) => {

    setLoading(true);

    try {

      const data =
        await authService.register(
          userData
        );

      return data;

    } finally {

      setLoading(false);

    }
  };

  // ============================================================
  // COMPLETE RESUME
  // ============================================================

  const completeResume = () => {

    setIsNewUser(false);

    localStorage.setItem(
      "isNewUser",
      "false"
    );

    localStorage.removeItem(
      "justRegistered"
    );
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {

    authService.logout();

    setIsAuthenticated(false);

    setIsNewUser(false);

    setUser(null);

    setToken(null);

    setResumeId(null);

    // ========================================================
    // CLEAR LOCAL STORAGE
    // ========================================================

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "res_id"
    );

    localStorage.removeItem(
      "resume_id"
    );

    localStorage.setItem(
      "isNewUser",
      "false"
    );

    localStorage.removeItem(
      "justRegistered"
    );

    // ========================================================
    // CLEAR GLOBAL TOKEN
    // ========================================================

    if (
      typeof window !== "undefined"
    ) {

      window.__APP_TOKEN__ =
        null;
    }
  };

  // ============================================================
  // UPDATE NEW USER
  // ============================================================

  const updateIsNewUser = (
    value
  ) => {

    setIsNewUser(value);

    localStorage.setItem(
      "isNewUser",
      value
        ? "true"
        : "false"
    );
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isNewUser,
        loading,

        // Resume ID
        resumeId,

        login,
        register,
        logout,
        completeResume,

        setIsNewUser:
          updateIsNewUser,

        setUser,

        setResumeId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// USE AUTH
// ============================================================

export function useAuth() {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

export default AuthContext;