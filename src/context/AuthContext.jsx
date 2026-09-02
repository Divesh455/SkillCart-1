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
    const saved = localStorage.getItem("token");
    if (!saved || saved === "undefined" || saved === "null" || !saved.trim()) {
      return null;
    }
    return saved;
  });

  // ============================================================
  // AUTHENTICATION STATE
  // ============================================================

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      const saved = localStorage.getItem("token");
      return Boolean(
        saved && saved !== "undefined" && saved !== "null" && saved.trim()
      );
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
    const savedRid =
      localStorage.getItem("res_id") ||
      localStorage.getItem("resume_id") ||
      null;

    if (!savedUser) {
      return savedRid ? { resumeId: savedRid } : null;
    }

    try {
      const parsed = JSON.parse(savedUser);
      if (parsed && !parsed.resumeId && savedRid) {
        parsed.resumeId = savedRid;
      }
      return parsed;
    } catch {
      return savedRid ? { resumeId: savedRid } : null;
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

      const userWithResumeId = authenticatedUser
        ? {
            ...authenticatedUser,
            resumeId:
              authenticatedUser.resumeId ||
              authenticatedUser.resume_id ||
              authenticatedUser.res_id ||
              authenticatedUser.Rid ||
              authenticatedUser.rid ||
              resumeIdFromLogin ||
              null,
          }
        : (resumeIdFromLogin
            ? { resumeId: resumeIdFromLogin }
            : null);

      // ========================================================
      // SAVE TO REACT STATE
      // ========================================================

      setToken(authToken);

      setUser(userWithResumeId);

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

      if (userWithResumeId) {

        localStorage.setItem(
          "user",
          JSON.stringify(
            userWithResumeId
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

        user: userWithResumeId,

        isNewUser: userIsNew,

        res_id:
          resumeIdFromLogin,

        resumeId:
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

      const extractedRid =
        extractRidFromResponse(data) ||
        data?.resumeId ||
        data?.resume_id ||
        data?.res_id ||
        data?.Rid ||
        data?.rid ||
        null;

      if (extractedRid) {
        setResumeId(String(extractedRid));
        localStorage.setItem("res_id", String(extractedRid));
        localStorage.setItem("resume_id", String(extractedRid));
      }

      return {
        ...data,
        resumeId: extractedRid || data?.resumeId || null,
        res_id: extractedRid || data?.res_id || null,
      };

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

  const updateResumeId = (newId) => {
    if (!newId || newId === "null" || newId === "undefined") {
      setResumeId(null);
      localStorage.removeItem("res_id");
      localStorage.removeItem("resume_id");
      setUser((prevUser) => {
        if (!prevUser) return null;
        const updated = { ...prevUser, resumeId: null };
        localStorage.setItem("user", JSON.stringify(updated));
        return updated;
      });
      return;
    }

    const strId = String(newId);
    setResumeId(strId);
    localStorage.setItem("res_id", strId);
    localStorage.setItem("resume_id", strId);
    setUser((prevUser) => {
      const updated = prevUser ? { ...prevUser, resumeId: strId } : { resumeId: strId };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

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

        setResumeId: updateResumeId,
        updateResumeId,
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