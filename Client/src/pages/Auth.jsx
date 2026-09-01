// src/pages/Auth.jsx
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SignIn from "../components/AuthComponents/SignIn/SignIn";
import SignUp from "../components/AuthComponents/SignUp/SignUp";
import AuthNavbar from "../components/AuthComponents/Navbar/Navbar"; // <-- Exact path

const Auth = () => {
  const { mode } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect away from /auth
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "client") {
        navigate("/client/dashboard", { replace: true });
      } else if (user.role === "freelancer") {
        navigate("/freelancer/dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        Verifying session...
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* 1. Auth Navbar with dynamic switch */}
      <AuthNavbar mode={mode} />

      {/* 2. Main Page Content */}
      <main className="auth-container">
        {mode === "signup" ? <SignUp /> : <SignIn />}
      </main>
    </div>
  );
};

export default Auth;