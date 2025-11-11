import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import notifySound from "./notify.mp3";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll always bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // Receive message
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (notificationsEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    return () => socket.off("message");
  }, [notificationsEnabled]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    socket.emit("message", { user: username, text: input });
    setInput("");
  };

  const enableNotifications = async () => {
    try {
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setNotificationsEnabled(true);
      alert("Bildirim sesi aktif!");
    } catch {
      alert("Tarayıcı ses izni vermedi. Manuel oynatım gerek.");
    }
  };

  if (!isReady) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2>Kullanıcı Adı</h2>
        <input
          type="text"
          placeholder="Kullanıcı adı..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={() => username.trim() !== "" && setIsReady(true)}>
          Giriş
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <audio ref={audioRef} src={notifySound} />

      {!notificationsEnabled && (
        <button
          onClick={enableNotifications}
          style={{
            marginBottom: 10,
            padding: "8px 14px",
            cursor: "pointer",
            borderRadius: 6,
          }}
        >
          🔔 Bildirim Sesini Aç
        </button>
      )}

      <h1>Chat</h1>

      {/* ---- MESAJ LİSTESİ ---- */}
      <div
        ref={messagesEndRef}
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "auto",
          padding: 10,
          whiteSpace: "pre-line",
        }}
      >
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}
      </div>

      {/* ---- MESAJ GÖNDERME ---- */}
      <div style={{ marginTop: 10 }}>
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>
    </div>
  );
}

export default App;
