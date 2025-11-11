import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [finalName, setFinalName] = useState("");
  const [permission, setPermission] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.user !== finalName && permission && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    return () => {
      socket.off("message");
    };
  }, [finalName, permission]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("message", { user: finalName, text: input });
    setInput("");
  };

  const joinChat = () => {
    if (!username.trim()) return;
    setFinalName(username);
  };

  const enableNotify = async () => {
    try {
      await Notification.requestPermission();
      setPermission(true);
    } catch {}
  };

  if (!finalName) {
    return (
      <div style={{ padding: 20 }}>
        <h2>İsmini Gir</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Kullanıcı adı"
        />
        <button onClick={joinChat}>Giriş</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <audio ref={audioRef} src="/notify.mp3" />

      {!permission && (
        <button
          onClick={enableNotify}
          style={{
            background: "orange",
            padding: "8px 16px",
            borderRadius: 8,
            marginBottom: 10,
          }}
        >
          Bildirim & Ses Aç
        </button>
      )}

      <h2>Hoş geldin, {finalName}</h2>

      <div
        style={{
          border: "1px solid #aaa",
          padding: 10,
          height: 300,
          overflowY: "auto",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <b>{msg.user}:</b> {msg.text}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10 }}>
        <input
          style={{ width: "70%" }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesaj yaz..."
        />
        <button onClick={sendMessage}>Gönder</button>
      </div>
    </div>
  );
}

export default App;
