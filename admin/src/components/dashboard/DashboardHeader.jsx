import { useEffect, useState } from "react";
import { FaBell, FaSearch } from "react-icons/fa";
import "../../assets/css/dashboardNew.css";

function DashboardHeader() {
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const loadNotifications = () => {
    fetch("http://localhost:8080/api/orders")
      .then((r) => (r.ok ? r.json() : []))
      .then((orders) => {
        const pendingOrders = orders
          .filter((order) => {
            const status = (
              order.orderStatus ||
              order.order_status ||
              ""
            ).toUpperCase();

            return (
              status !== "DELIVERED" &&
              status !== "CANCELLED"
            );
          })
          .sort((a, b) => b.id - a.id);

        setNotifications(pendingOrders);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/admin/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setProfile(data);
        }
      })
      .catch(() => {});

    loadNotifications();

    const refreshNotifications = () => {
      loadNotifications();
    };

    window.addEventListener(
      "orderUpdated",
      refreshNotifications
    );

    return () => {
      window.removeEventListener(
        "orderUpdated",
        refreshNotifications
      );
    };
  }, []);

  return (
    <div className="dashboard-header">
      <div>
        <h1>Dashboard</h1>
        <p>
          Welcome back, {profile?.name || "Admin"}!
        </p>
      </div>

      <div className="dashboard-right">
        <div className="search-box-dashboard">
          <FaSearch />
          <input
            type="text"
            placeholder="Search here..."
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="notification"
            onClick={() => setOpen(!open)}
          >
            <FaBell />

            {notifications.length > 0 && (
              <span>{notifications.length}</span>
            )}
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "50px",
                width: "350px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "15px",
                boxShadow:
                  "0 10px 25px rgba(0,0,0,.15)",
                zIndex: 9999,
              }}
            >
              <h3>Notifications</h3>

              {notifications.length > 0 ? (
                notifications.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      padding: "12px 0",
                      borderBottom:
                        "1px solid #eee",
                    }}
                  >
                    <strong>
                      Order #{order.id}
                    </strong>

                    <div>
                      Customer:{" "}
                      {order.customerName ||
                        "N/A"}
                    </div>

                    <div>
                      Email:{" "}
                      {order.customerEmail ||
                        "N/A"}
                    </div>

                    <div>
                      Phone:{" "}
                      {order.customerPhone ||
                        "N/A"}
                    </div>

                    <div>
                      Address:{" "}
                      {order.address || "N/A"}
                    </div>

                    <div>
                      Total: $
                      {Number(
                        order.total || 0
                      ).toFixed(2)}
                    </div>

                    <div>
                      Status:{" "}
                      {order.orderStatus}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    color: "#777",
                  }}
                >
                  No new notifications
                </div>
              )}
            </div>
          )}
        </div>

        <div className="admin-profile">
          <div className="admin-avatar">
            {(profile?.name || "A")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h4>
              {profile?.name || "Admin"}
            </h4>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;