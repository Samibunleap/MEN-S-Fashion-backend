import { useState, useEffect } from "react";

const API = "http://localhost:8080/api";

function StoreSettings() {
  const [store, setStore] = useState({
    storeName: "MEN'S Fashion",
    storeEmail: "store@fashion.com",
    storePhone: "+855 12 345 678",
    storeAddress: "Phnom Penh, Cambodia",
    currency: "USD",
    tax: "10",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API}/settings`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setStore((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    setStore({ ...store, [e.target.name]: e.target.value });
  };

  const saveStore = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");
      setMessage("Store settings saved successfully!");
    } catch (err) {
      setMessage(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-card">
      <h2>Store Information</h2>
      <form onSubmit={saveStore}>
        <div className="settings-grid">
          <div className="form-group">
            <label>Store Name</label>
            <input type="text" name="storeName" value={store.storeName} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Store Email</label>
            <input type="email" name="storeEmail" value={store.storeEmail} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" name="storePhone" value={store.storePhone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={store.currency} onChange={handleChange}>
              <option value="USD">USD ($)</option>
              <option value="KHR">KHR (៛)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tax (%)</label>
            <input type="number" name="tax" value={store.tax} onChange={handleChange} />
          </div>
          <div className="form-group full">
            <label>Store Address</label>
            <textarea rows="4" name="storeAddress" value={store.storeAddress} onChange={handleChange} />
          </div>
        </div>
        {message && (
          <p style={{ marginTop: "14px", color: message.includes("success") ? "#15803d" : "#b42318" }}>{message}</p>
        )}
        <div className="settings-buttons">
          <button type="submit" className="btn-save-settings" disabled={saving}>
            {saving ? "Saving..." : "Save Store"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StoreSettings;
