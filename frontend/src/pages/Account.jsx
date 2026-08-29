import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Account({ currentUser, onLogout }) {
  const navigate = useNavigate();
  if (!currentUser) return null;
  return (
    <main style={{minHeight:'70vh', padding:'70px 20px', background:'#120c08', color:'#fff'}}>
      <div style={{maxWidth:760, margin:'0 auto', background:'#1d2b28', border:'1px solid #39504a', borderRadius:20, padding:32}}>
        <p style={{color:'#c5a880', letterSpacing:3, fontSize:12, fontWeight:700}}>MEN'S FASHION</p>
        <h1 style={{marginTop:0}}>My Account</h1>
        <div style={{display:'grid', gap:14, marginTop:24}}>
          <div><strong>Name</strong><div style={{color:'#c9c9c9', marginTop:5}}>{currentUser.name || 'User'}</div></div>
          <div><strong>Email</strong><div style={{color:'#c9c9c9', marginTop:5}}>{currentUser.email || '-'}</div></div>
          <div><strong>Role</strong><div style={{color:'#c5a880', marginTop:5, textTransform:'capitalize'}}>{currentUser.role || 'customer'}</div></div>
        </div>
        <div style={{display:'flex', gap:12, flexWrap:'wrap', marginTop:28}}>
          {currentUser.role === 'admin' && <button onClick={() => window.location.href='http://localhost:5174/dashboard'} style={btn}>Admin Dashboard</button>}
          <button onClick={() => navigate('/')} style={btnSecondary}>Back to Website</button>
          <button onClick={onLogout} style={logoutBtn}>Logout</button>
        </div>
      </div>
    </main>
  );
}
const btn={border:'none',borderRadius:10,padding:'12px 18px',background:'#a9845b',color:'#fff',fontWeight:700,cursor:'pointer'};
const btnSecondary={...btn,background:'transparent',border:'1px solid #c5a880',color:'#c5a880'};
const logoutBtn={...btn,background:'#a33'};
