import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function SidebarNav({
  isOpen,
  onClose,
  cartCount = 0,
  openCart,
  openLoginModal,
  currentUser
}) {
  const navigate = useNavigate();
  const handleOpenCart = () => {
    onClose();
    if (openCart) openCart();
  };

  const handleLogin = () => {
    onClose();
    if (openLoginModal) openLoginModal();
  };

  return (
    <>
      {isOpen && <div className="nav-sidebar-overlay" onClick={onClose}></div>}

      <aside className={`nav-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="nav-sidebar-header">
          <h3>MEN'S</h3>
          <button className="nav-sidebar-close" onClick={onClose} aria-label="Close menu">
            &#10005;
          </button>
        </div>

        <div className="sidebar-account-box">
          <div className="account-avatar">
            <i className="far fa-user"></i>
          </div>
          <div className="account-info">
            <span className="welcome-text">
              {currentUser ? `Welcome, ${currentUser.name}` : 'Welcome, Guest'}
            </span>
            {!currentUser && (
              <button className="sidebar-login-btn" onClick={handleLogin}>
                Login / Register
              </button>
            )}
            {currentUser && (
              <>
                <button className="sidebar-login-btn" onClick={() => { onClose(); navigate('/account'); }}>My Account</button>
                {currentUser.role === 'admin' && <button className="sidebar-login-btn" onClick={() => { window.location.href = 'http://localhost:5174/dashboard'; }}>Admin Dashboard</button>}
                <button className="sidebar-login-btn" onClick={() => { localStorage.clear(); window.location.href='http://localhost:5173/?logout=1'; }}>Logout</button>
              </>
            )}
          </div>
        </div>

        <nav className="nav-sidebar-links">
          <NavLink to="/" onClick={onClose}>
            <i className="fas fa-home"></i> Home
          </NavLink>
          <NavLink to="/clothing" onClick={onClose}>
            <i className="fas fa-tshirt"></i> Clothing
          </NavLink>
          <NavLink to="/contact" onClick={onClose}>
            <i className="fas fa-envelope"></i> Contact
          </NavLink>

          <div className="sidebar-cart-item" onClick={handleOpenCart}>
            <div className="cart-left">
              <i className="fas fa-shopping-bag"></i>
              <span>Shopping Bag</span>
            </div>
            <span className="sidebar-cart-badge">{cartCount}</span>
          </div>
        </nav>
      </aside>
    </>
  );
}
