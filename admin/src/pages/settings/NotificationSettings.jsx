import { useState } from "react";

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    emailNotification: true,
    orderNotification: true,
    customerNotification: true,
    lowStockAlert: true,
    promotionNotification: false,
  });

  const handleChange = (e) => {
    setNotifications({
      ...notifications,
      [e.target.name]: e.target.checked,
    });
  };

  const saveNotifications = (e) => {
    e.preventDefault();
    alert("Notification settings saved successfully!");
  };

  return (
    <div className="settings-card">

      <h2>Notification Settings</h2>

      <form onSubmit={saveNotifications}>

        <div className="notification-list">

          <label className="notification-item">
            <input
              type="checkbox"
              name="emailNotification"
              checked={notifications.emailNotification}
              onChange={handleChange}
            />
            <span>Email Notifications</span>
          </label>

          <label className="notification-item">
            <input
              type="checkbox"
              name="orderNotification"
              checked={notifications.orderNotification}
              onChange={handleChange}
            />
            <span>Order Notifications</span>
          </label>

          <label className="notification-item">
            <input
              type="checkbox"
              name="customerNotification"
              checked={notifications.customerNotification}
              onChange={handleChange}
            />
            <span>Customer Registration Notifications</span>
          </label>

          <label className="notification-item">
            <input
              type="checkbox"
              name="lowStockAlert"
              checked={notifications.lowStockAlert}
              onChange={handleChange}
            />
            <span>Low Stock Alerts</span>
          </label>

          <label className="notification-item">
            <input
              type="checkbox"
              name="promotionNotification"
              checked={notifications.promotionNotification}
              onChange={handleChange}
            />
            <span>Promotion & Marketing Notifications</span>
          </label>

        </div>

        <div className="settings-buttons">

          <button
            type="submit"
            className="btn-save-settings"
          >
            Save Notification Settings
          </button>

        </div>  

      </form>

    </div>
  );
}

export default NotificationSettings;