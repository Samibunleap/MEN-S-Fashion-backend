import { useState } from "react";

const API = "http://localhost:8080/api";

function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${API}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");
      setMessage("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setMessage(err.message || "Password change failed. Make sure the backend is running.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Security Settings</h2>
      <form onSubmit={changePassword}>
        <div className="settings-grid">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handleChange} placeholder="Enter current password" required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" name="newPassword" value={passwords.newPassword} onChange={handleChange} placeholder="Enter new password" required />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} placeholder="Confirm new password" required />
          </div>
        </div>
        {message && (
          <p style={{ marginTop: "14px", color: message.includes("success") ? "#15803d" : "#b42318" }}>{message}</p>
        )}
        <div className="settings-buttons">
          <button type="submit" className="btn-save-settings" disabled={saving}>
            {saving ? "Saving..." : "Change Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SecuritySettings;
