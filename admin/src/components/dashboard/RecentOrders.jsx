import { useEffect, useState } from "react";
import "../../assets/css/dashboardNew.css";

const API = "http://localhost:8080/api";

function RecentOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch(`${API}/dashboard`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data && data.recentOrders) {
          setOrders(data.recentOrders.slice(0, 5));
        }
      })
      .catch(() => {});
  }, []);

  const getStatusClass = (status) => {
    const s = (status || "").toLowerCase().replace(/_/g, "-");
    if (s.includes("delivered")) return "delivered";
    if (s.includes("shipping") || s.includes("ready")) return "shipping";
    if (s.includes("preparing") || s.includes("processing")) return "processing";
    if (s.includes("cancelled")) return "cancelled";
    return "pending";
  };

  const getLabel = (status) => {
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
    <div className="recent-orders-card">
      <div className="card-header"><h3>Recent Orders</h3></div>
      <table className="dashboard-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead>
        <tbody>
          {orders.length > 0 ? orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>{order.payment_status === "PAYMENT_CONFIRMED" ? "Paid" : "Pending"}</td>
              <td><span className={`dashboard-status ${getStatusClass(order.order_status)}`}>{getLabel(order.order_status)}</span></td>
              <td>${Number(order.total || 0).toFixed(2)}</td>
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
