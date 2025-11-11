import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";
import notifySound from "../public/notify.mp3";

const SERVER_URL =
  process.env.REACT_APP_SERVER_URL ||
  "https://chat-backend-cisd.onrender.com";

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ SOCKET INIT
  useEffect(() => {
    socketRef.current = io(SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("chat message", (msg) => {
      console.log("📥 Alınan mesaj:", msg);
      setChat((prev) => [...prev, msg]);

      // ✅ KENDİ MESAJINSA → SES ÇALMA
      if (msg.user === username) return;

      // ✅ Bildirim + Ses
      if (notifyEnabled) {
        try {
          // ✅ Ses
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }

          // ✅ Tarayıcı bildirimi
          if (document.hidden && "Notification" in window) {
            new Notification(`${msg.user}`, { body: msg.text });
          }
        } catch (err) {
          console.error("Ses/notify hata:", err);
        }
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [username, notifyEnabled]);

  // ✅ Mesaj Gönderme
  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = { user: username, text: message };

    socketRef.current.emit("chat message", msg);
    setMessage("");
  };

  // ✅ Bildirim + SES aç
  const enableNotify = async () => {
    try {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setNotifyEnabled(true);
        }
      }

      // ✅ iOS Safari PRELOAD FIX
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
      } catch {}
    } catch {}
  };

  // ✅ Kullanıcı giriş ekranı
  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>İsim Gir</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setUsername(tempName)}
          placeholder="İsmin..."
        />
        <button onClick={() => setUsername(tempName)}>Devam</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 12 }}>
      <audio ref={audioRef} src={notifySound} preload="auto" />

      {/* ✅ BİLDİRİM AÇMA BUTONU */}
      {!notifyEnabled && (
        <button
          onClick={enableNotify}
          style={{
            padding: 8,
            border: "1px solid #444",
            marginBottom: 12,
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🔔 Bildirim & Ses Aç
        </button>
      )}

      {/* ✅ Mesaj Kutusu */}
      <div
        style={{
          height: "60vh",
          overflowY: "auto",
          border: "1px solid #888",
          padding: 8,
          borderRadius: 6,
        }}
      >
        {chat.map((c, i) => (
          <div
            key={i}
            style={{
              marginBottom: 6,
              fontWeight: c.user === username ? "bold" : "normal",
            }}
          >
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      {/* ✅ Mesaj Gönder */}
      <div style={{ marginTop: 12 }}>
        <input
          style={{ width: "70%", padding: 6 }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesaj yaz..."
        />
        <button onClick={sendMessage} style={{ padding: 6, marginLeft: 8 }}>
          Gönder
        </button>
      </div>
    </div>
  );
}

export default App;
