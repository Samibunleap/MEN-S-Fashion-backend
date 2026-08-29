import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function UpdateOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");

  useEffect(() => {
    fetch(`${API}/orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setOrder(data);
          setPaymentStatus(data.payment_status);
          setOrderStatus(data.order_status);
        }
      })
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAcceptPayment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/orders/${id}/payment/accept`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setPaymentStatus(data.payment_status);
        setOrderStatus(data.order_status);
        alert("Payment accepted!");
      }
    } catch {
      alert("Failed to accept payment");
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPayment = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/orders/${id}/payment/reject`, { method: "PUT" });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setPaymentStatus(data.payment_status);
        setOrderStatus(data.order_status);
        alert("Payment rejected.");
      }
    } catch {
      alert("Failed to reject payment");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");
      setOrder(data);
      setOrderStatus(data.order_status);
      alert("Order status updated!");
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!order) return <div className="add-product-page"><h2>Order not found.</h2></div>;

  const nextStatus = {
    PAYMENT_CONFIRMED: "PREPARING",
    PREPARING: "READY_TO_SHIP",
    READY_TO_SHIP: "SHIPPING",
    SHIPPING: "DELIVERED",
  };

  const nextStatusLabel = {
    PREPARING: "Mark as Preparing",
    READY_TO_SHIP: "Mark as Ready to Ship",
    SHIPPING: "Mark as Shipping",
    DELIVERED: "Mark as Delivered",
  };

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Update Order #{order.id}</h2>
        <div className="form-grid">
          <div className="form-group"><label>Customer</label><input value={order.customer_name} disabled /></div>
          <div className="form-group"><label>Total</label><input value={`$${Number(order.total || 0).toFixed(2)}`} disabled /></div>
          <div className="form-group"><label>Payment Status</label><input value={paymentStatus} disabled /></div>
          <div className="form-group"><label>Order Status</label><input value={orderStatus} disabled /></div>
        </div>

        <div style={{ marginTop: 25, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {paymentStatus === "PENDING_PAYMENT_REVIEW" && (
            <>
              <button className="btn-save" onClick={handleAcceptPayment} disabled={saving}>Accept Payment</button>
              <button className="btn-delete" onClick={handleRejectPayment} disabled={saving} style={{ background: "#b42318", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "8px", cursor: "pointer" }}>Reject Payment</button>
            </>
          )}
          {nextStatus[orderStatus] && paymentStatus === "PAYMENT_CONFIRMED" && (
            <button className="btn-save" onClick={() => handleUpdateStatus(nextStatus[orderStatus])} disabled={saving}>
              {nextStatusLabel[nextStatus[orderStatus]]}
            </button>
          )}
        </div>

        <div className="buttons" style={{ marginTop: 25 }}>
          <button className="btn-cancel" onClick={() => navigate("/orders")}>Back</button>
        </div>
      </div>
    </div>
  );
}

export default UpdateOrder;
