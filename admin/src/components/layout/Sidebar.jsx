import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaBoxOpen,
  FaShoppingCart,
  FaUsers,
  FaTags,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaArrowLeft,
  FaEnvelope,
} from "react-icons/fa";

function Sidebar({
  isOpen,
  onClose,
}) {
  const token =
    localStorage.getItem("authToken") || "";

  const backToWebsite =
    `http://localhost:5173/` +
    (token
      ? `?token=${encodeURIComponent(token)}`
      : "");

  const menu = [
    {
      name: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      name: "Products",
      icon: <FaBoxOpen />,
      path: "/products",
    },
    {
      name: "Orders",
      icon: <FaShoppingCart />,
      path: "/orders",
    },
    {
      name: "Customers",
      icon: <FaUsers />,
      path: "/customers",
    },
    {
      name: "Categories",
      icon: <FaTags />,
      path: "/categories",
    },
    {
      name: "Messages",
      icon: <FaEnvelope />,
      path: "/messages",
    },
    {
      name: "Reports",
      icon: <FaChartBar />,
      path: "/reports",
    },
    {
      name: "Settings",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  const handleLogout = async () => {
    const authToken =
      localStorage.getItem("authToken");

    if (authToken) {
      try {
        await fetch(
          "http://localhost:8080/api/auth/logout",
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${authToken}`,
            },
          }
        );
      } catch (error) {
        console.error(
          "Logout request failed:",
          error
        );
      }
    }

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");

    window.location.href =
      "http://localhost:5173/?logout=1";
  };

  return (
    <aside
      className={
        `sidebar ${
          isOpen ? "sidebar-open" : ""
        }`
      }
    >
      <button
        type="button"
        className="mobile-sidebar-close"
        onClick={onClose}
        aria-label="Close menu"
      >
        ×
      </button>

      <div className="sidebar-brand">
        <div className="logo">
          MEN&apos;S Fashion Admin
        </div>

        <a href={backToWebsite} className="back-to-website">
          <FaArrowLeft />
          <span>Back to Website</span>
        </a>
      </div>

      <nav>
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            {item.icon}

            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="logout">
        <button
          type="button"
          className="logout-btn"
          onClick={handleLogout}
        >
          <FaSignOutAlt />

          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;