import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="layout">
      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><FaBars /></button>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content"><Navbar /><div className="page-content"><Outlet /></div></div>
    </div>
  );
}
export default Layout;
