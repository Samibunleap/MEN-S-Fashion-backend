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

  const [selectedPayment, setSelectedPayment] = useState('aba'); // 'aba' or 'khqr'

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = 0;
  const total = subtotal + delivery;

  // ABA Pay Link របស់អ្នក
  const abaPayUrl = "https://pay.ababank.com/oRF8/frto5rqq";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.streetAddress || !formData.phone) {
      if (showToast) showToast('សូមបំពេញព័ត៌មាន Delivery ឱ្យបានគ្រប់គ្រាន់!');
      return;
    }

    // ១. រក្សាទុកទិន្នន័យ Order ចូលក្នុង System
    const newOrderData = {
      fullName: formData.fullName,
      streetAddress: formData.streetAddress,
      city: formData.city,
      phone: formData.phone,
      paymentMethod: selectedPayment === 'aba' ? 'ABA Mobile App' : 'Bakong KHQR'
    };
    onCompleteOrder(newOrderData);

    // ២. បើក ABA Mobile App ភ្លាមៗក្នុង Tab ថ្មី ឬ App
    window.open(abaPayUrl, '_blank');

    // ៣. បញ្ជូនទៅកាន់ Customer Dashboard
    navigate('/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#f9f6f0', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={handlePlaceOrder}>
          
          {/* Delivery Details Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: '#1a1a1a' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#1a1a1a', fontWeight: '600' }}>
              📍 Delivery details
            </h2>
            
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Full name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', backgroundColor: '#fafafa', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Street address</label>
              <input 
                type="text" 
                name="streetAddress" 
                value={formData.streetAddress} 
                onChange={handleChange}
                placeholder="e.g. St. 271, Sangkat Takhmao"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', backgroundColor: '#fafafa', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>City</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', backgroundColor: '#fafafa', color: '#1a1a1a' }}
              />
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#555', marginBottom: '8px', fontWeight: '500' }}>Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                placeholder="012 345 678"
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e0e0e0', outline: 'none', fontSize: '15px', backgroundColor: '#fafafa', color: '#1a1a1a' }}
              />
            </div>
          </div>

          {/* Payment Method Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: '#1a1a1a' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Payment method</h2>
            
            {/* ABA Direct Link Option */}
            <div 
              onClick={() => setSelectedPayment('aba')}
              style={{ 
                border: selectedPayment === 'aba' ? '2px solid #005e7e' : '1px solid #e0e0e0', 
                borderRadius: '12px', 
                padding: '16px', 
                backgroundColor: selectedPayment === 'aba' ? '#f0f8ff' : '#fff',
                cursor: 'pointer',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#005e7e', marginBottom: '4px' }}>
                  💳 ABA Mobile Direct Pay
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Tap to open ABA App directly and approve payment
                </div>
              </div>
              <input type="radio" checked={selectedPayment === 'aba'} onChange={() => setSelectedPayment('aba')} />
            </div>
          </div>

          {/* Order Summary Card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', color: '#1a1a1a' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: '600' }}>Order Summary</h2>

            {cart.map((item) => (
              <div key={`${item.id}-${item.size}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#444' }}>
                <span>{item.name} × {item.qty}</span>
                <span style={{ fontWeight: '600' }}>${(item.price * item.qty).toFixed(2)}</span>
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#666' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#666' }}>
              <span>Delivery</span>
              <span>Free</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '16px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: '#1a1a1a' }}>
              <span>Total</span>
              <span style={{ color: '#b89768' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button 
            type="submit" 
            style={{ width: '100%', padding: '16px', borderRadius: '12px', backgroundColor: '#005e7e', color: '#fff', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            Pay ${total.toFixed(2)} via ABA App
          </button>
        </form>
      </div>
    </div>
  );
}