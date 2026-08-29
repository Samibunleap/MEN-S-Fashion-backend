import "../../assets/css/global.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8080/api";

function CustomerList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCustomers = async () => {
    try {
      const res = await fetch(`${API}/customers`);
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCustomers(); }, []);

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();
    return (
      (customer.name || "").toLowerCase().includes(keyword) ||
      (customer.email || "").toLowerCase().includes(keyword) ||
      (customer.phone || "").toLowerCase().includes(keyword)
    );
  });

  const deleteCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      const res = await fetch(`${API}/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCustomers(customers.filter((c) => c.id !== id));
      }
    } catch {
      alert("Failed to delete customer");
    }
  };

  return (
    <div className="product-page">
      <div className="product-header">
        <h1>Customers</h1>
      </div>

      <input
        className="search-box"
        type="text"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p style={{ textAlign: "center", padding: "40px" }}>Loading customers...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="product-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Total Orders</th>
                <th>Status</th>
                <th width="220">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>{customer.id}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone || "-"}</td>
                    <td>{customer.totalOrders || 0}</td>
                    <td>
                      <span className={`badge ${customer.status === "active" ? "status-active" : "status-blocked"}`}>
                        {customer.status === "active" ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button className="btn-view" onClick={() => navigate(`/customers/${customer.id}`)}>View</button>
                      <button className="btn-edit" onClick={() => navigate(`/customers/edit/${customer.id}`)}>Edit</button>
                      <button className="btn-delete" onClick={() => deleteCustomer(customer.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerList;
