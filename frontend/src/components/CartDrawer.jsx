import React from 'react';

export default function CartDrawer({ isOpen, onClose, cart, updateQty, removeItem, showToast, onCheckout }) {
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <>
      <div className="cart-overlay open" onClick={onClose}></div>
      <div className="cart-drawer open">
        <div className="cart-header">
          <h3>Your Bag</h3>
          <button className="cart-close" onClick={onClose}>&#10005;</button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <i className="fas fa-shopping-bag"></i>
              <p>Your bag is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.size}`} className="cart-item">
                <img className="cart-item-img" src={item.img || item.image} alt={item.name} />
                <div className="cart-item-info">
                  <h4>{item.name}</h4>
                  <div className="cart-item-price">${item.price} · Size {item.size}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.size, -1)}>&#8722;</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.size, 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(item.id, item.size)}>&#10005;</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', textAlign: 'center', padding: '16px' }}
              onClick={onCheckout}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}