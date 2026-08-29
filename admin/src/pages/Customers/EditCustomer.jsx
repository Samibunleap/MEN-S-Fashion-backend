import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function EditCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", status: "active" });

  useEffect(() => {
    fetch(`${API}/customers/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Not found"))
      .then((data) => {
        setCustomer({ name: data.name || "", email: data.email || "", phone: data.phone || "", status: data.status || "active" });
      })
      .catch(() => setMessage("Customer not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`${API}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setMessage("Customer updated successfully!");
      setTimeout(() => navigate("/customers"), 1000);
    } catch (err) {
      setMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Edit Customer</h2>
        <form onSubmit={updateCustomer}>
          <div className="form-grid">
            <div className="form-group"><label>Customer ID</label><input value={id} disabled /></div>
            <div className="form-group"><label>Customer Name</label><input type="text" name="name" value={customer.name} onChange={handleChange} required /></div>
            <div className="form-group"><label>Email</label><input type="email" name="email" value={customer.email} onChange={handleChange} required /></div>
            <div className="form-group"><label>Phone</label><input type="text" name="phone" value={customer.phone} onChange={handleChange} /></div>
            <div className="form-group full">
              <label>Status</label>
              <select name="status" value={customer.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          {message && <p style={{ marginTop: "14px", color: message.includes("success") ? "#15803d" : "#b42318" }}>{message}</p>}
          <div className="buttons">
            <button type="button" className="btn-cancel" onClick={() => navigate("/customers")}>Cancel</button>
            <button type="submit" className="btn-save" disabled={saving}>{saving ? "Saving..." : "Update Customer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomer;
