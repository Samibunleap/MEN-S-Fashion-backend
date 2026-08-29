import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Invalid email or password");

      if (data.user.role !== "admin") {
        setError("This account is a customer account. Please use the customer website.");
        return;
      }

      if (data.token) localStorage.setItem("authToken", data.token);
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", "admin");
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleLogin}>
        <div className="login-logo">
          <h1>MEN'S Fashion</h1>
          <span>ADMIN DASHBOARD</span>
        </div>

        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login with your administrator account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="admin@gmail.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            required
          />
        </div>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="demo">
          <p>Demo Admin</p>
          <span>admin@gmail.com / admin123</span>
        </div>
      </form>
    </div>
  );
}

export default Login;
