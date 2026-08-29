import "../../assets/css/settings.css";

import ProfileSettings from "./ProfileSettings";
import StoreSettings from "./StoreSettings";
import SecuritySettings from "./SecuritySettings";
import NotificationSettings from "./NotificationSettings";

function Settings() {
  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>Settings</h1>
        <p>Dashboard / Settings</p>
      </div>

      <ProfileSettings />

      <StoreSettings />

      <SecuritySettings />

      <NotificationSettings />

    </div>
  );
}

export default Settings;