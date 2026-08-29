import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../assets/css/addProduct.css";

const API = "http://localhost:8080/api";

function OrderDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!order) return <div className="add-product-page"><h2>Order not found.</h2></div>;

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="add-product-page">
      <div className="product-card">
        <h2>Order Detail</h2>
        <div className="form-grid">
          <div className="form-group"><label>Order ID</label><input value={`#${order.id}`} disabled /></div>
          <div className="form-group"><label>Order Date</label><input value={order.created_at} disabled /></div>
          <div className="form-group"><label>Customer</label><input value={order.customer_name} disabled /></div>
          <div className="form-group"><label>Phone</label><input value={order.customer_phone || "-"} disabled /></div>
          <div className="form-group full"><label>Email</label><input value={order.customer_email || "-"} disabled /></div>
          <div className="form-group full"><label>Address</label><textarea rows="2" value={order.address || "-"} disabled /></div>
          <div className="form-group"><label>Payment Method</label><input value={order.payment_method} disabled /></div>
          <div className="form-group"><label>Payment Status</label><input value={order.payment_status} disabled /></div>
          <div className="form-group"><label>Order Status</label><input value={order.order_status} disabled /></div>
          <div className="form-group"><label>Total</label><input value={`$${Number(order.total || 0).toFixed(2)}`} disabled /></div>
        </div>

        <h3 style={{ marginTop: 30 }}>Products</h3>
        {items.length > 0 ? (
          <table className="product-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>${Number(item.unitPrice || item.price || 0).toFixed(2)}</td>
                  <td>${(Number(item.unitPrice || item.price || 0) * (item.qty || 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items in this order.</p>
        )}

        <div className="buttons" style={{ marginTop: 25 }}>
          <button className="btn-cancel" onClick={() => navigate("/orders")}>Back</button>
          <button className="btn-save" onClick={() => navigate(`/orders/update/${order.id}`)}>Update Order</button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetail;
