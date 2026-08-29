import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import "../../assets/css/dashboardNew.css";

function DashboardHeader() {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminProfile") || "null"); } catch { return null; }
  });
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/profile").then(r => r.ok ? r.json() : null).then(data => {
      if (data) { setProfile(data); localStorage.setItem("adminProfile", JSON.stringify(data)); }
    }).catch(() => {});
    fetch("http://localhost:8080/api/orders").then(r => r.ok ? r.json() : []).then(orders => {
      const pending = orders.filter(o => o.paymentStatus === "PENDING_PAYMENT_REVIEW");
      setNotifications(pending.map(o => ({ id:o.id, text:`Order #${o.id} needs payment review` })));
    }).catch(() => {});
  }, []);

  return <div className="dashboard-header">
    <div><h1>Dashboard</h1><p>Welcome back, {profile?.name || "Admin"}! Here's what's happening today.</p></div>
    <div className="dashboard-right">
      <div className="search-box-dashboard"><FaSearch /><input type="text" placeholder="Search here..." /></div>
      <div style={{position:"relative"}}>
        <button type="button" className="notification" onClick={() => setOpen(v => !v)} aria-label="Notifications"><FaBell />{notifications.length > 0 && <span>{notifications.length}</span>}</button>
        {open && <div style={{position:"absolute",right:0,top:"48px",width:"300px",background:"#fff",border:"1px solid #ddd",borderRadius:"12px",boxShadow:"0 12px 30px rgba(0,0,0,.18)",padding:"12px",zIndex:9999}}>
          <strong>Notifications</strong>
          {notifications.length ? notifications.map(n => <div key={n.id} style={{padding:"10px 0",borderBottom:"1px solid #eee"}}>{n.text}</div>) : <div style={{padding:"12px 0",color:"#777"}}>No new notifications</div>}
        </div>}
      </div>
      <div className="admin-profile">
        {profile?.image ? <img src={profile.image} alt={profile.name || "Admin User"} className="admin-avatar" /> : <div className="admin-avatar" style={{display:"grid",placeItems:"center",background:"#e9e1d8",fontWeight:800}}>{(profile?.name || "A").charAt(0).toUpperCase()}</div>}
        <div><h4>{profile?.name || "Admin User"}</h4><small>Administrator</small></div>
      </div>
    </div>
  </div>;
}
export default DashboardHeader;
