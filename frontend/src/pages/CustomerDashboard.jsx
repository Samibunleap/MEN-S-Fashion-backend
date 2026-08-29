import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:8080/api';

export default function CustomerDashboard({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!currentUser) return;

    const fetchOrders = () => {
      fetch(`${API}/orders`)
        .then((r) => r.ok ? r.json() : [])
        .then((data) => {
          if (Array.isArray(data)) {
            const myOrders = data.filter(
              (o) => o.customer_email && currentUser.email &&
              o.customer_email.toLowerCase() === currentUser.email.toLowerCase()
            );
            setOrders(myOrders);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: '#ffffff', backgroundColor: '#121c19', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <i className="fas fa-lock" style={{ fontSize: '48px', color: '#c5a880', marginBottom: '16px' }}></i>
        <h2 style={{ fontSize: '24px', margin: '0 0 8px 0' }}>Please login to view your dashboard</h2>
        <p style={{ color: '#a0a0a0', marginBottom: '24px' }}>Login to track your orders and account</p>
        <button
          onClick={() => navigate('/')}
          style={{ backgroundColor: '#c5a880', color: '#121c19', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.payment_status === 'PENDING_PAYMENT_REVIEW' || o.order_status === 'AWAITING_PAYMENT_CONFIRMATION').length;
  const deliveredOrdersCount = orders.filter((o) => o.order_status === 'DELIVERED').length;
  const grandTotalAmount = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const statusSteps = ['AWAITING_PAYMENT_CONFIRMATION', 'PAYMENT_CONFIRMED', 'PREPARING', 'READY_TO_SHIP', 'SHIPPING', 'DELIVERED'];
  const statusLabels = {
    AWAITING_PAYMENT_CONFIRMATION: 'Awaiting Payment',
    PAYMENT_CONFIRMED: 'Payment Confirmed',
    PREPARING: 'Preparing',
    READY_TO_SHIP: 'Ready to Ship',
    SHIPPING: 'Shipping',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  const statusColors = {
    AWAITING_PAYMENT_CONFIRMATION: '#e67e22',
    PAYMENT_CONFIRMED: '#3498db',
    PREPARING: '#9b59b6',
    READY_TO_SHIP: '#2ecc71',
    SHIPPING: '#1abc9c',
    DELIVERED: '#27ae60',
    CANCELLED: '#e74c3c',
  };

  const getPaymentLabel = (ps) => {
    const labels = {
      PENDING_PAYMENT_REVIEW: 'Pending Review',
      PAYMENT_CONFIRMED: 'Payment Confirmed',
      PAYMENT_REJECTED: 'Payment Rejected',
    };
    return labels[ps] || ps || 'Unknown';
  };

  const getOrderStatusLabel = (os) => statusLabels[os] || os || 'Unknown';

  return (
    <div style={{ backgroundColor: '#121c19', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif', color: '#ffffff' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', letterSpacing: '2px', color: '#c5a880', fontWeight: 'bold', textTransform: 'uppercase' }}>
              MEN'S FASHION STORE
            </span>
            <h1 style={{ fontSize: '28px', color: '#ffffff', margin: '4px 0 0 0', fontWeight: '600' }}>
              My Dashboard
            </h1>
          </div>
          <button onClick={onLogout} style={{ backgroundColor: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid #e74c3c', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
            <i className="fas fa-sign-out-alt" style={{ marginRight: '6px' }}></i> Logout
          </button>
        </div>

        {/* Profile Card */}
        <div style={{ backgroundColor: '#1b2a26', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid rgba(197, 168, 128, 0.2)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c5a880', fontSize: '24px', border: '1px solid #c5a880' }}>
            <i className="far fa-user"></i>
          </div>
          <div>
            <h2 style={{ fontSize: '22px', color: '#ffffff', margin: '0 0 6px 0', textTransform: 'capitalize' }}>{currentUser.name}</h2>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#a0a0a0', flexWrap: 'wrap' }}>
              <span>Email: <strong style={{ color: '#ffffff' }}>{currentUser.email}</strong></span>
              <span>Phone: <strong style={{ color: '#ffffff' }}>{currentUser.phone || 'N/A'}</strong></span>
              <span>Role: <strong style={{ color: '#c5a880' }}>Customer</strong></span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#1b2a26', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
            <div style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-clipboard-list" style={{ color: '#c5a880' }}></i> Total Orders
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#c5a880' }}>{totalOrdersCount}</div>
          </div>
          <div style={{ backgroundColor: '#1b2a26', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
            <div style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="far fa-clock" style={{ color: '#e67e22' }}></i> Pending
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#e67e22' }}>{pendingOrdersCount}</div>
          </div>
          <div style={{ backgroundColor: '#1b2a26', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
            <div style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-check-circle" style={{ color: '#27ae60' }}></i> Delivered
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>{deliveredOrdersCount}</div>
          </div>
          <div style={{ backgroundColor: '#1b2a26', padding: '20px', borderRadius: '16px', border: '1px solid rgba(197, 168, 128, 0.15)' }}>
            <div style={{ color: '#a0a0a0', fontSize: '13px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="fas fa-dollar-sign" style={{ color: '#27ae60' }}></i> Total Spent
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#27ae60' }}>${grandTotalAmount.toFixed(2)}</div>
          </div>
        </div>

        {/* Order History */}
        <div style={{ backgroundColor: '#1b2a26', borderRadius: '16px', padding: '24px', border: '1px solid rgba(197, 168, 128, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '18px', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                My Order History
              </h2>
              <p style={{ fontSize: '12px', color: '#a0a0a0', margin: '4px 0 0 0' }}>
                Track your orders, total amount, and delivery status
              </p>
            </div>
            <span style={{ backgroundColor: 'rgba(197, 168, 128, 0.15)', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', color: '#c5a880', border: '1px solid #c5a880' }}>
              Total: {totalOrdersCount}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a0a0a0' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#a0a0a0' }}>
              <i className="fas fa-box-open" style={{ fontSize: '40px', marginBottom: '12px', color: '#555' }}></i>
              <p>No orders yet. Start shopping!</p>
              <button onClick={() => navigate('/clothing')} style={{ marginTop: '12px', backgroundColor: '#c5a880', color: '#121c19', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Browse Products
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => {
                const items = (() => { try { return Array.isArray(order.items) ? order.items : JSON.parse(order.items); } catch { return []; } })();
                const isActive = selectedOrder === order.id;

                return (
                  <div key={order.id} style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', backgroundColor: isActive ? 'rgba(197, 168, 128, 0.08)' : 'rgba(255, 255, 255, 0.03)', cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => setSelectedOrder(isActive ? null : order.id)}>

                    {/* Order Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#a0a0a0', textTransform: 'uppercase' }}>ORDER ID</div>
                        <div style={{ fontWeight: 'bold', color: '#c5a880', fontSize: '16px' }}>#{order.id}</div>
                        <div style={{ fontSize: '12px', color: '#777' }}>{order.created_at}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ backgroundColor: `${statusColors[order.payment_status] || '#666'}22`, color: statusColors[order.payment_status] || '#666', border: `1px solid ${statusColors[order.payment_status] || '#666'}`, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {getPaymentLabel(order.payment_status)}
                        </span>
                        <span style={{ backgroundColor: `${statusColors[order.order_status] || '#666'}22`, color: statusColors[order.order_status] || '#666', border: `1px solid ${statusColors[order.order_status] || '#666'}`, padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                          {getOrderStatusLabel(order.order_status)}
                        </span>
                      </div>
                    </div>

                    {/* Tracking Progress Bar (only when expanded) */}
                    {isActive && order.order_status !== 'CANCELLED' && (
                      <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#c5a880', marginBottom: '12px' }}>Order Tracking</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
                          {statusSteps.map((step, idx) => {
                            const currentStepIndex = statusSteps.indexOf(order.order_status);
                            const isCompleted = idx <= currentStepIndex;
                            const isCurrent = idx === currentStepIndex;
                            return (
                              <div key={step} style={{ flex: 1, minWidth: '80px', textAlign: 'center', position: 'relative' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: isCompleted ? '#c5a880' : '#333', border: isCurrent ? '3px solid #fff' : '2px solid #555', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: isCompleted ? '#121c19' : '#777' }}>
                                  {isCompleted ? '✓' : idx + 1}
                                </div>
                                <div style={{ fontSize: '10px', color: isCompleted ? '#c5a880' : '#666', fontWeight: isCurrent ? 'bold' : 'normal' }}>
                                  {statusLabels[step]}
                                </div>
                                {idx < statusSteps.length - 1 && (
                                  <div style={{ position: 'absolute', top: '12px', left: '60%', width: '80%', height: '2px', backgroundColor: isCompleted && idx < currentStepIndex ? '#c5a880' : '#333' }}></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Customer Info */}
                    <div style={{ fontSize: '13px', color: '#aaa', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      Customer: <strong style={{ color: '#fff' }}>{order.customer_name}</strong> | Phone: <strong style={{ color: '#fff' }}>{order.customer_phone || 'N/A'}</strong> | Address: <strong style={{ color: '#fff' }}>{order.address || 'N/A'}</strong>
                    </div>

                    {/* Order Items */}
                    {isActive && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img src={item.img || 'https://placehold.co/48x48?text=No+Image'} alt={item.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#ffffff' }}>
                                  {item.name} × {item.qty}
                                </div>
                                <div style={{ fontSize: '12px', color: '#a0a0a0' }}>
                                  {item.details || ''} | Unit price: ${Number(item.unitPrice || item.price || 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                            <div style={{ fontWeight: 'bold', color: '#c5a880', fontSize: '15px' }}>
                              ${(Number(item.unitPrice || item.price || 0) * (item.qty || 1)).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#777' }}>{isActive ? 'Click to collapse' : 'Click to view details'}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '13px', color: '#a0a0a0' }}>Total:</span>
                        <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                          ${(Number(order.total) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
