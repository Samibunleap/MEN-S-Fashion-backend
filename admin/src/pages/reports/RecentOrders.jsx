import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/report.css";

const API = "http://localhost:8080/api";

function RecentOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API}/orders`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (Array.isArray(data)) setOrders(data.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  const getStatusLabel = (status) => {
    const labels = {
      AWAITING_PAYMENT_CONFIRMATION: "Pending",
      PAYMENT_CONFIRMED: "Confirmed",
      PREPARING: "Processing",
      READY_TO_SHIP: "Ready",
      SHIPPING: "Shipping",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
    };
    return labels[status] || status || "Unknown";
  };

  return (
    <div className="report-card-large">
      <div className="card-title">
        <h3>Recent Orders</h3>
        <button className="view-all" onClick={() => navigate("/orders")}>View All</button>
      </div>
      <table className="report-table">
        <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>
          {orders.length > 0 ? orders.map((order) => (
            <tr key={order.id}>
              <td style={{ color: "#7b553c", fontWeight: "600", cursor: "pointer" }} onClick={() => navigate(`/orders/${order.id}`)}>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>${Number(order.total || 0).toFixed(2)}</td>
              <td>{order.payment_status === "PAYMENT_CONFIRMED" ? "Paid" : "Pending"}</td>
              <td><span className={`badge status-${(order.order_status || "").toLowerCase().replace(/_/g, "-")}`}>{getStatusLabel(order.order_status)}</span></td>
            </tr>
          )) : (
            <tr><td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>No orders yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RecentOrders;
