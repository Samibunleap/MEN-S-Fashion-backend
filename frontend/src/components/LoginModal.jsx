import React, { useState } from "react";

const API = "http://localhost:8080";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: ""
  });

  if (!isOpen) return null;

  const isRegister = mode === "register";

  const change = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? {
            name: form.fullName,
            phone: form.phone,
            email: form.email,
            password: form.password
          }
        : {
            email: form.email,
            password: form.password
          };

      const response = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      const user = data.user;
      if (data.token) localStorage.setItem("authToken", data.token);
      localStorage.setItem("currentUser", JSON.stringify(user));

      // Admin opens the dashboard through a backend session bridge so login works
      // even though the website and admin dashboard use different ports.
      if (user.role === "admin") {
        window.location.href = `http://localhost:5174/auth/bridge?token=${encodeURIComponent(data.token || "")}`;
        return;
      }

      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setError(err.message || "Unable to continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button type="button" style={styles.close} onClick={onClose} aria-label="Close">
          ×
        </button>

        <div style={styles.brand}>
          <div style={styles.brandLine}>MEN</div>
          <div style={styles.brandLine}>FASHION</div>
          <div style={styles.brandSub}>STORE SYSTEM</div>
        </div>

        <div style={styles.welcome}>
          <h2>{isRegister ? "Create Account" : "Welcome Back"}</h2>
          <p>{isRegister ? "Create your account to continue" : "Please login to continue"}</p>
        </div>

        <div style={styles.switcher}>
          <button
            type="button"
            onClick={() => switchMode("login")}
            style={{ ...styles.switchButton, ...(mode === "login" ? styles.switchActive : {}) }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            style={{ ...styles.switchButton, ...(mode === "register" ? styles.switchActive : {}) }}
          >
            Register
          </button>
        </div>

        <form onSubmit={submit} style={styles.form}>
          {isRegister && (
            <>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                name="fullName"
                value={form.fullName}
                onChange={change}
                placeholder="Enter full name"
                required
              />

              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                name="phone"
                value={form.phone}
                onChange={change}
                placeholder="Enter phone number"
              />
            </>
          )}

          <label style={styles.label}>{isRegister ? "Email Address" : "Username / Email"}</label>
          <input
            style={styles.input}
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            placeholder={isRegister ? "Enter email address" : "Enter username or email"}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            name="password"
            value={form.password}
            onChange={change}
            placeholder="Enter password"
            required
          />

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.loginButton} disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Login"}
          </button>
        </form>

        <div style={styles.footerText}>
          {isRegister ? (
            <>
              Already have an account?{" "}
              <button type="button" style={styles.linkButton} onClick={() => switchMode("login")}>
                Login
              </button>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <button type="button" style={styles.linkButton} onClick={() => switchMode("register")}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    background: "rgba(10, 8, 7, 0.68)",
    backdropFilter: "blur(5px)",
    overflowY: "auto"
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    boxSizing: "border-box",
    position: "relative",
    padding: "30px 38px 28px",
    borderRadius: "24px",
    background: "linear-gradient(180deg, #ffffff 0%, #f5f2ef 100%)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    color: "#2a3038",
    maxHeight: "92vh",
    overflowY: "auto"
  },
  close: {
    position: "absolute",
    top: "14px",
    right: "18px",
    width: "36px",
    height: "36px",
    border: "none",
    background: "transparent",
    color: "#684c35",
    fontSize: "30px",
    lineHeight: 1,
    cursor: "pointer"
  },
  brand: {
    textAlign: "center",
    marginBottom: "25px",
    color: "#6b4d34",
    letterSpacing: "9px",
    fontWeight: 800
  },
  brandLine: {
    fontSize: "42px",
    lineHeight: 1.15
  },
  brandSub: {
    marginTop: "10px",
    fontSize: "10px",
    letterSpacing: "7px",
    color: "#7a6b5d"
  },
  welcome: {
    textAlign: "center",
    marginBottom: "18px"
  },
  switcher: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "6px",
    padding: "5px",
    marginBottom: "18px",
    borderRadius: "14px",
    background: "#ebe5df"
  },
  switchButton: {
    border: "none",
    borderRadius: "10px",
    padding: "10px",
    background: "transparent",
    color: "#6b625b",
    cursor: "pointer",
    fontWeight: 700,
    textTransform: "uppercase"
  },
  switchActive: {
    background: "#8a6242",
    color: "#fff",
    boxShadow: "0 6px 16px rgba(89,55,30,0.18)"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  label: {
    marginTop: "5px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#4a4038"
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    height: "48px",
    padding: "0 15px",
    borderRadius: "12px",
    border: "1px solid #d7d2cd",
    outline: "none",
    background: "#fff",
    fontSize: "14px",
    color: "#333"
  },
  error: {
    marginTop: "5px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fff0f0",
    color: "#b42318",
    fontSize: "13px"
  },
  loginButton: {
    width: "100%",
    marginTop: "14px",
    minHeight: "50px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(90deg, #765036, #a47755)",
    color: "#fff",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    textTransform: "uppercase"
  },
  footerText: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    color: "#756b63"
  },
  linkButton: {
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#8a6242",
    fontWeight: 800,
    cursor: "pointer"
  }
};
