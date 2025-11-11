import React from "react";

const NotificationsBar = ({ notifEnabled, soundEnabled, onNotifToggle, onSoundToggle }) => {
  return (
    <div style={{ width: "90%", margin: "auto", marginBottom: 10 }}>
      <button onClick={onNotifToggle}>
      🔔 Bildirim {notifEnabled ? "✅" : "❌"}
      </button>

      <button onClick={onSoundToggle} style={{ marginLeft: 10 }}>
      🔊 Ses {soundEnabled ? "✅" : "❌"}
      </button>
    </div>
  );
};

export default NotificationsBar;
