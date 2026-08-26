import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchMe = async () => {
    try {
      const res = await API.get("/users/me");
      setUser(res.data.data);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    const res = await API.post("/users/signup", userData);
    const { user, token } = res.data.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return res.data.data;
  };

  const signin = async (email, password) => {
    const res = await API.post("/users/signin", { email, password });
    const { user, token } = res.data.data;
    localStorage.setItem("token", token);
    setToken(token);
    setUser(user);
    return res.data.data;
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