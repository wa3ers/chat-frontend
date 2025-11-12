import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import UserAvatar from "./UserAvatar";
import ProfileModal from "./ProfileModal";

const ChatHeader = () => {
  const { username, avatarUrl } = useUser();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        style={{
          backgroundColor: "#159A8C",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* 👇 Avatar tıklanınca modal açılıyor */}
        <div style={{ cursor: "pointer" }} onClick={() => setOpen(true)}>
          <UserAvatar name={username} imageUrl={avatarUrl} size={48} />
        </div>

        <div>
          <div style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
            {username || "Misafir"}
          </div>
          <div style={{ fontSize: 13, color: "#e2e2e2" }}>Çevrimiçi 💬</div>
        </div>
      </div>

      {open && <ProfileModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default ChatHeader;
