import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header({ cartCount, openCart, onSelectProduct, openNavSidebar, openLoginModal, currentUser, onLogout, products = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // A route change (for example My Account) must not leave “No results” open.
    setShowSearchDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
    setShowUserDropdown(false);
  }, [location.pathname]);

  const handleUserClick = (e) => {
    e.preventDefault();
    if (currentUser) setShowUserDropdown((v) => !v);
    else openLoginModal();
  };

  const logout = () => {
    setShowUserDropdown(false);
    if (onLogout) onLogout();
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const q = val.trim().toLowerCase();
    if (!q) {
      setShowSearchDropdown(false);
      setSearchResults([]);
      return;
    }
    const filtered = products.filter((p) =>
      [p.name, p.cat || p.category, p.tag].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
    setSearchResults(filtered);
    setShowSearchDropdown(true);
  };

  const handleSelect = (product) => {
    if (onSelectProduct) onSelectProduct(product);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className="site-header-wrap" id="siteHeaderWrap">
      <header id="header">
        <Link className="logo" to="/">MEN'S</Link>
        <nav className="desktop-nav">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
          <Link to="/clothing" className={location.pathname === '/clothing' ? 'active' : ''}>Clothing</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </nav>
        <div className="header-actions">
          <button type="button" className="cart-count" onClick={openCart} style={{ cursor:'pointer', background:'none', border:'none' }}>
            <i className="fas fa-shopping-bag" title="Cart"></i><div className="cart-badge">{cartCount}</div>
          </button>
          <div style={{ position:'relative' }}>
            <button type="button" onClick={handleUserClick} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', padding:'4px 8px' }}>
              <i className="far fa-user" style={{ fontSize:'18px' }}></i>
              <span style={{ fontSize:'12px', color:'#c5a880', fontWeight:'bold' }}>{currentUser ? currentUser.name : 'Login / Register'}</span>
              {currentUser && <i className="fas fa-chevron-down" style={{ fontSize:10 }}></i>}
            </button>
            {currentUser && showUserDropdown && (
              <div style={{ position:'absolute', right:0, top:'calc(100% + 10px)', minWidth:190, background:'#fff', border:'1px solid #e5ddd4', borderRadius:12, boxShadow:'0 15px 35px rgba(0,0,0,.2)', overflow:'hidden', zIndex:10000 }}>
                <button onClick={() => { setShowUserDropdown(false); navigate('/account'); }} style={menuBtn}><i className="far fa-user"></i> My Account</button>
                <button onClick={logout} style={{ ...menuBtn, color:'#b42318' }}><i className="fas fa-sign-out-alt"></i> Logout</button>
              </div>
            )}
          </div>
          {currentUser?.role === 'admin' && <button type="button" onClick={() => { window.location.href='http://localhost:5174/dashboard'; }} className="admin-dashboard-link" style={{border:'1px solid #c5a880',background:'transparent',color:'#a9845b',borderRadius:'7px',padding:'7px 10px',cursor:'pointer',fontSize:'12px',fontWeight:700,whiteSpace:'nowrap'}}><i className="fas fa-cog"></i> Admin Dashboard</button>}
          <button type="button" className="mobile-menu-btn" onClick={openNavSidebar} aria-label="Open Navigation" style={{ marginLeft:'10px' }}><i className="fas fa-bars"></i></button>
        </div>
      </header>
      <div className="header-search-bar" style={{ position:'relative' }}>
        <div className="header-search-inner"><input type="text" placeholder="Search products, styles, brands…" value={searchQuery} onChange={handleSearch} autoComplete="off" /><i className="fas fa-search"></i></div>
        {showSearchDropdown && <div className="search-dropdown" style={{ display:'block' }}>
          {searchResults.length === 0 ? <div className="sd-not-found"><i className="fas fa-search"></i><p>No results for <strong>"{searchQuery}"</strong></p></div> : searchResults.map((p) => <div key={p.id} className="sd-item" onClick={() => handleSelect(p)}><img src={p.img || p.image} alt={p.name} /><div className="sd-info"><div className="sd-name">{p.name}</div><div className="sd-meta">{p.cat || p.category} · ${p.price}</div></div><i className="fas fa-chevron-right"></i></div>)}
        </div>}
      </div>
    </div>
  );
}
const menuBtn = { width:'100%', border:'none', background:'#fff', padding:'12px 16px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:10, color:'#3b3028', fontWeight:600 };
