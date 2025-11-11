import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const audioRef = useRef(
    typeof Audio !== "undefined" ? new Audio("/notify.mp3") : null
  );

  // Bildirim izni & ses
  const enableNotifications = async () => {
    try {
      const p = await Notification.requestPermission();
      if (p === "granted") {
        setNotifEnabled(true);
        audioRef.current?.play().catch(() => {});
      }
    } catch (e) {}
  };

  // Mesaj alma
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (notifEnabled) {
        audioRef.current?.play().catch(() => {});
        try {
          new Notification(`${msg.user}: ${msg.text}`);
        } catch (e) {}
      }
    });

    return () => socket.off("message");
  }, [notifEnabled]);

  // Kullanıcı adını ayarla
  const handleStart = () => {
    if (!username.trim()) return;
    setIsReady(true);
  };

  // Mesaj gönder
  const sendMessage = () => {
    if (!input.trim()) return;
    const msg = { user: username, text: input };
    socket.emit("message", msg);
    setInput("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chat</h1>

      {!isReady && (
        <div>
          <input
            placeholder="Kullanıcı adı..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 5 }}
          />
          <button onClick={handleStart} style={{ marginLeft: "10px" }}>
            Başla
          </button>
        </div>
      )}

      {isReady && (
        <>
          {!notifEnabled && (
            <button
              onClick={enableNotifications}
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                padding: 8,
                background: "yellow",
              }}
            >
              🔔 Bildirim & Ses Aç
            </button>
          )}

          <div
            style={{
              border: "1px solid black",
              height: "350px",
              overflowY: "auto",
              padding: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <p key={i}>
                <b>{msg.user}:</b> {msg.text}
              </p>
            ))}
          </div>

          <input
            placeholder="Mesaj yaz..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ marginTop: 10, padding: 5, width: "200px" }}
          />
          <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
            Gönder
          </button>
        </>
      )}
    </div>
  );
}

export default App;
