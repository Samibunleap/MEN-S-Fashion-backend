import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ទាញយក User Data
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('current_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ទាញយក Order Data តាម User Email
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('user_orders');
    return savedOrders ? JSON.parse(savedOrders) : [];
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('user_orders', JSON.stringify(orders));
  }, [orders]);

  // MOCK: បង្កើត Account ថ្មី ឬ Login
  const login = (userData) => {
    const userObj = {
      name: userData.fullName || userData.email.split('@')[0],
      email: userData.email,
      phone: userData.phone || '1234567822',
      role: 'Customer',
      status: 'Active',
    };
    setCurrentUser(userObj);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // មុខងារពេលអតិថិជនកុម្ម៉ង់ទិញទំនិញ
  const addOrder = (item) => {
    if (!currentUser) return alert('សូម Login ជាមុនសិន!');

    const newOrder = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toLocaleString(),
      paymentStatus: 'PAYMENT: VERIFIED',
      orderStatus: 'ORDER: COMPLETED',
      customerName: currentUser.name,
      phone: currentUser.phone,
      userEmail: currentUser.email,
      items: [
        {
          name: item.name || 'Coconut Latte',
          qty: item.qty || 1,
          details: item.details || 'Size: M · Sugar: 30% · Ice: ទឹកកកធម្មតា',
          unitPrice: item.price || 2.50,
          img: item.img || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=150&auto=format&fit=crop&q=60',
        },
      ],
      totalAmount: item.price || 2.50,
    };

    setOrders((prev) => [newOrder, ...prev]);
  };

  return (
    <AuthContext.Provider value={{ currentUser, orders, login, logout, addOrder }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);