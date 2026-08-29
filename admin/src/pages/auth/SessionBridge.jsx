import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API = "http://localhost:8080";
export default function SessionBridge() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Opening Admin Dashboard...");
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { navigate("/login", { replace: true }); return; }
    fetch(`${API}/api/auth/session`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error("Invalid session")))
      .then((data) => {
        if (data.user?.role !== "admin") throw new Error("Not an admin account");
        localStorage.setItem("authToken", token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", "admin");
        navigate("/dashboard", { replace: true });
      })
      .catch(() => { setMessage("Your admin session is invalid. Please login again."); setTimeout(() => navigate("/login", { replace: true }), 1200); });
  }, [navigate]);
  return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", fontFamily: "Arial, sans-serif" }}>{message}</div>;
}
