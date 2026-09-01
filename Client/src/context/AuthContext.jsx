// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Check auth once on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const res = await API.get("/users/me");
          const userData = res.data?.data?.user || res.data?.data || res.data?.user || res.data;
          setUser(userData);
        } catch (error) {
          console.error("Auth verification failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signup = async (userData) => {
    const res = await API.post("/users/signup", userData);
    const data = res.data?.data || res.data;
    const token = data.token;
    const user = data.user || data;

    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return { user, token };
  };

  const signin = async (email, password) => {
    const res = await API.post("/users/signin", { email, password });
    const data = res.data?.data || res.data;
    const token = data.token;
    const user = data.user || data;

    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return { user, token };
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};