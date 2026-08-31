import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout({ cart = [], currentUser, onCompleteOrder, showToast }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: currentUser?.name || '',
    streetAddress: '',
    city: 'Phnom Penh',
    phone: currentUser?.phone || ''
  });

  const [selectedPayment, setSelectedPayment] = useState('aba');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 0;
  const total = subtotal + delivery;

  const abaPayUrl = "https://pay.ababank.com/oRF8/frto5rqq";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.streetAddress || !formData.phone) {
      if (showToast) showToast('Please fill in all delivery details!');
      return;
    }
    const newOrderData = {
      fullName: formData.fullName,
      streetAddress: formData.streetAddress,
      city: formData.city,
      phone: formData.phone,
      paymentMethod: selectedPayment === 'aba' ? 'ABA Mobile App' : 'Bakong KHQR'
    };
    onCompleteOrder(newOrderData);
    window.open(abaPayUrl, '_blank');
    navigate('/dashboard');
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <form onSubmit={handlePlaceOrder}>

          {/* Delivery Details Card */}
          <div className="checkout-card">
            <h2>📍 Delivery details</h2>

            <div className="checkout-field">
              <label htmlFor="checkout-fullName">Full name</label>
              <input
                id="checkout-fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-street">Street address</label>
              <input
                id="checkout-street"
                type="text"
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                placeholder="e.g. St. 271, Sangkat Takhmao"
              />
            </div>

            <div className="checkout-field">
              <label htmlFor="checkout-city">City</label>
              <input
                id="checkout-city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="checkout-field" style={{ marginBottom: '8px' }}>
              <label htmlFor="checkout-phone">Phone</label>
              <input
                id="checkout-phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="012 345 678"
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="checkout-card">
            <h2>Payment method</h2>

            <div
              onClick={() => setSelectedPayment('aba')}
              className={`checkout-payment-option ${selectedPayment === 'aba' ? 'selected' : ''}`}
            >
              <div>
                <div className="checkout-payment-title">💳 ABA Mobile Direct Pay</div>
                <div className="checkout-payment-desc">
                  Tap to open ABA App directly and approve payment
                </div>
              </div>
              <input type="radio" checked={selectedPayment === 'aba'} onChange={() => setSelectedPayment('aba')} />
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="checkout-card">
            <h2>Order Summary</h2>

            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="checkout-summary-item">
                <span>{item.name} × {item.qty}</span>
                <span>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}

            <hr className="checkout-divider" />

            <div className="checkout-summary-item" style={{ color: '#666' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div className="checkout-summary-item" style={{ color: '#666', marginBottom: '16px' }}>
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <hr className="checkout-divider" />

            <div className="checkout-total-row">
              <span>Total</span>
              <span className="total-price">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button type="submit" className="checkout-pay-btn">
            Pay ${total.toFixed(2)} via ABA App
          </button>
        </form>
      </div>
    </div>
  );
}
