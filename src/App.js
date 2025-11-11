import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const backendURL = "https://chat-backend1-aib9.onrender.com";

const socket = io(backendURL, {
  transports: ["websocket", "polling"],
});

// ✅ Global erişim için
window.socket = socket;

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState("");
  const [notifReady, setNotifReady] = useState(false);
  const [soundReady, setSoundReady] = useState(false);

  const audioRef = useRef(null);

  // ✅ Bildirim + Ses Aç
  const enableNotifAndSound = async () => {
    // Bildirim izni
    if ("Notification" in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotifReady(perm === "granted");
      } catch {
        setNotifReady(false);
      }
    }

    // Ses izni (MOBIL İÇİN ÇOK ÖNEMLİ)
    try {
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setSoundReady(true);
    } catch {
      setSoundReady(false);
    }
  };

  // ✅ Gelen mesajları dinle
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // ✅ Kendi mesajında ses çalma → YOK
      if (msg.user === user) return;

      // ✅ BİLDİRİM
      if (notifReady && Notification.permission === "granted") {
        new Notification(`${msg.user}: ${msg.text}`);
      }

      // ✅ SES
      if (soundReady && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    });

    return () => socket.off("message");
  }, [notifReady, soundReady, user]);

  // ✅ Mesaj gönder
  const sendMessage = () => {
    if (!message.trim()) return;

    const newMsg = { user, text: message };
    socket.emit("message", newMsg);

    setMessages((prev) => [...prev, newMsg]); // Anında göster
    setMessage("");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Chat</h1>

      <button
        onClick={enableNotifAndSound}
        style={{
          background: "#ffd74b",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        🔔 Bildirim & 🔊 Ses Aç
      </button>

      <div style={{ marginTop: "10px" }}>
        Bildirim: {notifReady ? "Açık ✅" : "Kapalı ❌"} | Ses:{" "}
        {soundReady ? "Hazır ✅" : "Kapalı ❌"}
      </div>

      {!user && (
        <div style={{ marginTop: "15px" }}>
          <span>İsim girin: </span>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="İsim..."
          />
        </div>
      )}

      <div
        style={{
          marginTop: "15px",
          border: "1px solid #ccc",
          padding: "10px",
          height: "300px",
          overflowY: "auto",
          borderRadius: "6px",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", display: "flex", gap: "5px" }}>
        <input
          style={{ flex: 1 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>

      {/* ✅ SES ELEMENTI → Mobil uyumlu */}
      <audio
        ref={audioRef}
        src="/notify.mp3"
        preload="auto"
        playsInline
      />
    </div>
  );
}

export default App;
