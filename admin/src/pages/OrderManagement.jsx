
import React, { useEffect, useState } from "react";

const API = "http://localhost:8080/api";
const labels = {
  AWAITING_PAYMENT_CONFIRMATION: "Pending Payment Review",
  PAYMENT_CONFIRMED: "Payment Confirmed",
  PREPARING: "Preparing",
  READY_TO_SHIP: "Ready to Ship",
  SHIPPING: "Shipping",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled"
};

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    const res = await fetch(`${API}/orders`);
    setOrders(await res.json());
  };
  useEffect(() => { load(); }, []);

  const action = async (id, endpoint, body) => {
    const res = await fetch(`${API}/orders/${id}${endpoint}`, {
      method: "PUT",
      headers: {"Content-Type":"application/json"},
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if (!res.ok) setMessage(data.message || "Action failed");
    else { setMessage("Order updated successfully"); load(); }
  };

  return (
    <div className="order-management">
      <h1>Customer Orders</h1>
      {message && <p>{message}</p>}
      {orders.map(order => (
        <div key={order.id} className="order-card">
          <h3>Order #{order.id}</h3>
          <p><b>Customer:</b> {order.customerName}</p>
          <p><b>Phone:</b> {order.customerPhone}</p>
          <p><b>Total:</b> ${order.total}</p>
          <p><b>Payment:</b> {order.paymentStatus}</p>
          <p><b>Status:</b> {labels[order.orderStatus] || order.orderStatus}</p>

          {order.paymentStatus === "PENDING_PAYMENT_REVIEW" && (
            <button onClick={() => action(order.id, "/payment/accept")}>Accept Payment</button>
          )}
          {order.paymentStatus === "PAYMENT_CONFIRMED" && order.orderStatus === "PAYMENT_CONFIRMED" && (
            <button onClick={() => action(order.id, "/status", {status:"PREPARING"})}>Prepare Order</button>
          )}
          {order.orderStatus === "PREPARING" && (
            <button onClick={() => action(order.id, "/status", {status:"READY_TO_SHIP"})}>Ready to Ship</button>
          )}
          {order.orderStatus === "READY_TO_SHIP" && (
            <button onClick={() => action(order.id, "/status", {status:"SHIPPING"})}>Shipping</button>
          )}
          {order.orderStatus === "SHIPPING" && (
            <button onClick={() => action(order.id, "/status", {status:"DELIVERED"})}>Delivered</button>
          )}
        </div>
      ))}
    </div>
  );
}
