import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import SidebarNav from './components/SidebarNav';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import SizeGuideModal from './components/SizeGuideModal';
import LoginModal from './components/LoginModal';

import Home from './pages/Home';
import Clothing from './pages/Clothing';
import Contacts from './pages/Contacts';
import CustomerDashboard from './pages/CustomerDashboard';
import Account from './pages/Account';
import Checkout from './pages/Checkout'; // Import Checkout Component
import { products as defaultProducts } from './Data/products';

// Prevent an admin account from being shown as a customer dashboard.
function AdminDashboardRedirect() {
  window.location.replace('http://localhost:5174/dashboard');
  return null;
}

// Component ជំនួយសម្រាប់ការផ្លាស់ប្តូរ Route ក្នុង App
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState(defaultProducts);

  // Load admin-created products without replacing or colliding with the original catalog.
  // Backend IDs are prefixed for the website because the original demo catalog also uses numeric IDs.
  useEffect(() => {
    let cancelled = false;

    fetch('http://localhost:8080/api/products')
      .then((r) => (r.ok ? r.json() : []))
      .then((list) => {
        if (cancelled || !Array.isArray(list)) return;

        const adminProducts = list.map((p) => ({
          ...p,
          backendId: p.id,
          id: `admin-${p.id}`,
          img: p.image || p.img || '',
          image: p.image || p.img || '',
          cat: p.category || p.cat || 'Clothing',
          tag: String(p.category || p.cat || p.tag || 'clothing').toLowerCase(),
          source: 'admin'
        }));

        // The built-in catalog remains untouched. Admin products are added after it.
        setProducts([...defaultProducts, ...adminProducts]);
      })
      .catch(() => {
        // Keep original products visible even when backend is unavailable.
        setProducts(defaultProducts);
      });

    return () => { cancelled = true; };
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('mens-cart');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  });

  // User & Orders State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('customerOrders');
    return saved ? JSON.parse(saved) : [];
  });

  // Restore an admin session after clicking "Back to Website" from the admin dashboard.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get('token');
    if (!tokenFromUrl) return;
    fetch('http://localhost:8080/api/auth/session', { headers: { Authorization: `Bearer ${tokenFromUrl}` } })
      .then((r) => r.ok ? r.json() : Promise.reject(new Error('Invalid session')))
      .then((data) => {
        localStorage.setItem('authToken', tokenFromUrl);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        setCurrentUser(data.user);
        params.delete('token');
        navigate(`${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`, { replace: true });
      })
      .catch(() => { params.delete('token'); navigate(location.pathname, { replace: true }); });
  }, [location.search]);

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    try {
      // Persist only cart fields; large uploaded base64 images can exceed browser quota.
      const safeCart = cart.map((item) => ({
        id: item.id,
        backendId: item.backendId,
        name: item.name,
        price: Number(item.price) || 0,
        size: item.size,
        qty: item.qty,
        image: item.image || item.img || '',
        img: item.img || item.image || '',
        cat: item.cat || item.category || 'Clothing'
      }));
      localStorage.setItem('mens-cart', JSON.stringify(safeCart));
    } catch (error) {
      console.warn('Cart storage quota exceeded; cart remains available for this session.', error);
    }
  }, [cart]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('customerOrders', JSON.stringify(orders));
  }, [orders]);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  }, []);

  const addToCart = useCallback((id, size = 'M') => {
    const p = products.find((x) => String(x.id) === String(id));
    if (!p) return;
    setCart((prev) => {
      const existing = prev.find((item) => String(item.id) === String(id) && item.size === size);
      if (existing) return prev.map((item) => String(item.id) === String(id) && item.size === size ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, {
        id: p.id,
        backendId: p.backendId,
        name: p.name,
        price: Number(p.price) || 0,
        size,
        qty: 1,
        image: p.image || p.img || '',
        img: p.img || p.image || '',
        cat: p.cat || p.category || 'Clothing'
      }];
    });
    showToast(`${p.name} added to bag`);
    setIsCartOpen(true);
  }, [products, showToast]);

  const updateQty = useCallback((id, size, delta) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id && item.size === size ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  }, []);

  const removeItem = useCallback((id, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  }, []);

  const totalCartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  // មុខងារ Redirect ទៅ Checkout ពេលចុច Proceed to Checkout ពី Cart Drawer
  const handleCheckout = () => {
    if (!currentUser) {
      setIsCartOpen(false);
      setIsLoginOpen(true);
      showToast('សូម Login ឬ Register ជាមុនសិន!');
      return;
    }

    if (cart.length === 0) {
      showToast('សូមជ្រើសរើសទំនិញជាមុនសិន');
      return;
    }

    setIsCartOpen(false);
    navigate('/checkout'); // នាំទៅទំព័រ Checkout
  };

  // មុខងារនេះបង្កើត Order បន្ទាប់ពីទូទាត់ Bakong KHQR រួចរាល់
  const handleCompleteOrder = (deliveryDetails) => {
    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrder = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
      paymentStatus: 'PAYMENT: VERIFIED',
      orderStatus: 'ORDER: COMPLETED',
      customerName: deliveryDetails.fullName,
      phone: deliveryDetails.phone,
      address: `${deliveryDetails.streetAddress}, ${deliveryDetails.city}`,
      userEmail: currentUser.email,
      items: cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        details: `Size: ${item.size}`,
        unitPrice: item.price,
        img: item.image || item.img || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150',
      })),
      totalAmount: total,
    };

    fetch('http://localhost:8080/api/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerName:newOrder.customerName,customerEmail:newOrder.userEmail,customerPhone:newOrder.phone,address:newOrder.address,paymentMethod:'ABA / Bank Transfer',items:newOrder.items,total:newOrder.totalAmount})}).then(r=>r.json()).then(saved=>{ setOrders((prev)=>[saved,...prev]); setCart([]); showToast('ការទិញបានជោគជ័យ!'); }).catch(()=>{ setOrders((prev)=>[newOrder,...prev]); setCart([]); showToast('Order saved locally'); });
  };

  const handleLogout = () => {
    const token = localStorage.getItem('authToken');
    if (token) fetch('http://localhost:8080/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    showToast('បានចាកចេញពីគណនី');
    navigate('/', { replace: true });
  };

  return (
    <div className="app-main-wrapper" style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#120c08' }}>
      <Header 
        cartCount={totalCartCount} 
        openCart={() => setIsCartOpen(true)} 
        openNavSidebar={() => setIsNavOpen(true)}
        openLoginModal={() => setIsLoginOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        products={products}
        onSelectProduct={setSelectedProduct}
      />

      <SidebarNav 
        isOpen={isNavOpen} 
        onClose={() => setIsNavOpen(false)} 
        cartCount={totalCartCount}
        openCart={() => setIsCartOpen(true)}
        openLoginModal={() => setIsLoginOpen(true)}
        currentUser={currentUser}
      />

      <Routes>
        <Route path="/" element={<Home products={products} onSelectProduct={setSelectedProduct} addToCart={addToCart} />} />
        <Route path="/clothing" element={<Clothing products={products} onSelectProduct={setSelectedProduct} addToCart={addToCart} />} />
        <Route path="/contact" element={<Contacts showToast={showToast} />} />
        <Route path="/contacts" element={<Navigate to="/contact" replace />} />

        {/* Route សម្រាប់ទំព័រ Checkout ថ្មី */}
        <Route 
          path="/checkout" 
          element={
            <Checkout 
              cart={cart} 
              currentUser={currentUser} 
              onCompleteOrder={handleCompleteOrder} 
              showToast={showToast} 
            />
          } 
        />

        {/* Customer Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={
            currentUser?.role === 'admin' ? <AdminDashboardRedirect /> :
            <CustomerDashboard 
              currentUser={currentUser} 
              onLogout={handleLogout} 
            />
          } 
        />

        <Route
          path="/account"
          element={
            !currentUser ? <Navigate to="/" replace /> :
            currentUser.role === 'admin' ? <AdminDashboardRedirect /> :
            <CustomerDashboard
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer openSizeModal={() => setIsSizeGuideOpen(true)} />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`ស្វាគមន៍ ${user.name}`);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQty={updateQty}
        removeItem={removeItem}
        showToast={showToast}
        onCheckout={handleCheckout}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={addToCart}
        openSizeGuide={() => setIsSizeGuideOpen(true)}
      />

      <SizeGuideModal 
        isOpen={isSizeGuideOpen} 
        onClose={() => setIsSizeGuideOpen(false)} 
      />

      {toastMsg && (
        <div className="toast show" style={{ zIndex: 99999 }}>
          <i className="fas fa-check-circle"></i>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}