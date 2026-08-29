import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function CustomerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/customers/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject("Not found"))
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!customer) return <div style={{ padding: "30px" }}><h2>Customer Not Found</h2></div>;

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Customer Detail</h2>
        <div className="form-grid">
          <div className="form-group"><label>Customer ID</label><input value={customer.id} disabled /></div>
          <div className="form-group"><label>Customer Name</label><input value={customer.name} disabled /></div>
          <div className="form-group"><label>Email</label><input value={customer.email} disabled /></div>
          <div className="form-group"><label>Phone</label><input value={customer.phone || "-"} disabled /></div>
          <div className="form-group"><label>Status</label><input value={customer.status || "active"} disabled /></div>
          <div className="form-group"><label>Total Orders</label><input value={customer.totalOrders || 0} disabled /></div>
          <div className="form-group"><label>Total Spent</label><input value={`$${(customer.totalSpent || 0).toFixed(2)}`} disabled /></div>
          <div className="form-group"><label>Joined</label><input value={customer.created_at || "-"} disabled /></div>
        </div>

        {customer.orders && customer.orders.length > 0 && (
          <>
            <h3 style={{ marginTop: 30 }}>Order History</h3>
            <table className="product-table">
              <thead><tr><th>Order ID</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {customer.orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>${Number(o.total || 0).toFixed(2)}</td>
                    <td>{o.payment_status}</td>
                    <td>{o.order_status}</td>
                    <td>{o.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="buttons" style={{ marginTop: 25 }}>
          <button className="btn-cancel" onClick={() => navigate("/customers")}>Back</button>
          <button className="btn-save" onClick={() => navigate(`/customers/edit/${customer.id}`)}>Edit Customer</button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
