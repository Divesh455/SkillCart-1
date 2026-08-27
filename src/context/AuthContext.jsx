import {
  createContext,
  useContext,
  useState,
} from "react";

import authService from "../services/authService";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

  // ==========================================
  // INITIAL TOKEN
  // ==========================================

  const [token, setToken] = useState(() => {

    return localStorage.getItem("token") || null;

  });


  // ==========================================
  // AUTHENTICATION STATE
  // ==========================================

  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {

      return !!localStorage.getItem("token");

    });


  // ==========================================
  // NEW USER
  // ==========================================

  const [isNewUser, setIsNewUser] =
    useState(() => {

      return (
        localStorage.getItem(
          "isNewUser"
        ) === "true"
      );

    });


  // ==========================================
  // USER
  // ==========================================

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


  // ==========================================
  // LOADING
  // ==========================================

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // LOGIN
  // ==========================================

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


      // ========================================
      // GET REAL TOKEN
      // ========================================

      const authToken =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken;


      // ========================================
      // NEVER CREATE FAKE TOKEN
      // ========================================

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


      // ========================================
      // GET USER
      // ========================================

      const authenticatedUser =
        data?.user ||
        data?.data?.user ||
        null;


      // ========================================
      // NEW USER STATUS
      // ========================================

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


      // ========================================
      // SAVE TO REACT STATE
      // ========================================

      setToken(authToken);

      setUser(authenticatedUser);

      setIsAuthenticated(true);

      setIsNewUser(userIsNew);


      // ========================================
      // SAVE TO LOCAL STORAGE
      // ========================================

      localStorage.setItem(
        "token",
        authToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify(
          authenticatedUser
        )
      );

      localStorage.setItem(
        "isNewUser",
        userIsNew
          ? "true"
          : "false"
      );


      // ========================================
      // OPTIONAL GLOBAL TOKEN
      // ========================================

      if (
        typeof window !== "undefined"
      ) {

        window.__APP_TOKEN__ =
          authToken;

      }


      // ========================================
      // RETURN LOGIN DATA
      // ========================================

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


  // ==========================================
  // REGISTER
  // ==========================================

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


  // ==========================================
  // COMPLETE RESUME
  // ==========================================

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


  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {

    authService.logout();

    setIsAuthenticated(false);

    setIsNewUser(false);

    setUser(null);

    setToken(null);


    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.setItem(
      "isNewUser",
      "false"
    );

    localStorage.removeItem(
      "justRegistered"
    );


    if (
      typeof window !== "undefined"
    ) {

      window.__APP_TOKEN__ = null;

    }

  };


  // ==========================================
  // UPDATE NEW USER
  // ==========================================

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


  // ==========================================
  // PROVIDER
  // ==========================================

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
        setIsNewUser:
          updateIsNewUser,
        setUser,
      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used within an AuthProvider"
    );

  }


  return context;

}


export default AuthContext;