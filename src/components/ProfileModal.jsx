import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";

export default function ProfileModal({ onClose }) {
  const { username, setAvatarUrl } = useUser();
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (preview) {
      localStorage.setItem("avatarUrl", preview);
      setAvatarUrl(preview);
    }
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#1e2f35",
          color: "white",
          padding: 20,
          borderRadius: 10,
          width: 320,
          textAlign: "center",
        }}
      >
        <h3>Profil Ayarları</h3>
        <p>{username}</p>

        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <img
            src={preview}
            alt="Önizleme"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              marginTop: 10,
              objectFit: "cover",
              border: "2px solid #159A8C",
            }}
          />
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleSave}
            style={{
              background: "#28a745",
              padding: "6px 12px",
              borderRadius: 5,
              cursor: "pointer",
              border: "none",
              color: "white",
            }}
          >
            Kaydet
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#dc3545",
              padding: "6px 12px",
              borderRadius: 5,
              cursor: "pointer",
              border: "none",
              color: "white",
            }}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
