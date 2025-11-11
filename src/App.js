// src/App.js
import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

// Backend URL'i .env ile verebilirsin:
// REACT_APP_SERVER_URL=https://chat-backend-xxxxx.onrender.com
const SERVER_URL =
  process.env.REACT_APP_SERVER_URL || "https://chat-backend-cisd.onrender.com";

export default function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [notifReady, setNotifReady] = useState(false);
  const [soundReady, setSoundReady] = useState(false);

  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // ---- Socket bağlan
  useEffect(() => {
    const s = io(SERVER_URL, { transports: ["websocket"] });
    socketRef.current = s;

    s.on("connect", () => {
      // console.log("✅ Socket connected");
    });

    s.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Sadece BAŞKASINDAN gelen mesajda bildir + ses
      if (msg.user && msg.user !== username) {
        // Tarayıcı bildirimi
        if (window.Notification && Notification.permission === "granted") {
          new Notification(`${msg.user}:`, { body: msg.text });
        }

        // Ses
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              // küçük bir reset
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
            })
            .catch(() => {});
        }
      }
    });

    return () => {
      s.disconnect();
    };
  }, [username]);

  // ---- Ses nesnesini hazırla
  useEffect(() => {
    // public klasöründen servis edilir
    audioRef.current = new Audio("/notify.mp3");
    // iOS & Android için düşük gecikme için 'canplaythrough' tetiklenene kadar preload
    const a = audioRef.current;
    const onReady = () => setSoundReady(true);
    a.addEventListener("canplaythrough", onReady, { once: true });
    a.load();
    return () => a.removeEventListener("canplaythrough", onReady);
  }, []);

  // ---- Odaya katıl
  const join = () => {
    const name = (tempName || "Anonim").trim();
    setUsername(name);
    setTempName("");
    socketRef.current?.emit("ready", { user: name });
  };

  // ---- Mesaj gönder
  const sendMessage = () => {
    const txt = message.trim();
    if (!txt) return;
    const payload = { user: username || "Anonim", text: txt };
    socketRef.current?.emit("message", payload);
    setMessages((prev) => [...prev, payload]); // hemen ekranda gör
    setMessage("");
    // KENDİ mesajında ses çalma YOK.
  };

  // ---- Bildirim & Ses izinleri
  const enableNotifAndSound = async () => {
    // Bildirim izni
    if ("Notification" in window) {
      try {
        const res = await Notification.requestPermission();
        setNotifReady(res === "granted");
      } catch {
        setNotifReady(false);
      }
    }

    // Ses “unlock” — mobilde şart
    if (audioRef.current) {
      try {
        await audioRef.current.play(); // tetikle
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setSoundReady(true);
      } catch {
        // kullanıcı sessiz/engelli olabilir
        setSoundReady(false);
      }
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: "0 16px" }}>
      <h1>Chat</h1>

      {/* Üst çubuk: Bildirim & Ses */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          padding: "10px 12px",
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 12,
          background: "#f7f8fa",
        }}
      >
        <button onClick={enableNotifAndSound} style={btnStyle}>
          🔔 Bildirim & 🔊 Ses Aç
        </button>
        <small>
          Bildirim:{" "}
          <b>
            {notifReady || Notification.permission === "granted"
              ? "Açık"
              : "Kapalı"}
          </b>{" "}
          | Ses: <b>{soundReady ? "Hazır" : "Hazır değil"}</b>
        </small>
      </div>

      {/* Kullanıcı adı alanı */}
      {!username ? (
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <input
            placeholder="Kullanıcı adı..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            style={inputStyle}
          />
          <button onClick={join} style={btnStyle}>
            Katıl
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: 12 }}>
          <b>Giriş yaptın:</b> {username}
        </div>
      )}

      {/* Mesaj listesi */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          height: 260,
          overflowY: "auto",
          padding: 12,
          background: "#fff",
          marginBottom: 12,
          whiteSpace: "pre-wrap",
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.user ?? "Anonim"}:</b> {m.text}
          </div>
        ))}
      </div>

      {/* Mesaj gönder alanı */}
      <div style={{ display: "flex", gap: 8 }}>
        <input
          placeholder="Mesaj yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          style={{ ...inputStyle, flex: 1 }}
        />
        <button onClick={sendMessage} style={btnStyle}>
          Gönder
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  outline: "none",
};

const btnStyle = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #bbb",
  background: "#fff",
  cursor: "pointer",
};
