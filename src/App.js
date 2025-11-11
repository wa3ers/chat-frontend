import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempUser, setTempUser] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const audioRef = useRef(null);
  const [allowed, setAllowed] = useState(false);

  // Bildirim izni
  const requestNotification = () => {
    Notification.requestPermission().then((res) => {
      if (res === "granted") {
        setAllowed(true);
      }
    });

    // Ses test
    try {
      audioRef.current.play();
    } catch {}
  };

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.user !== username) {
        if (allowed) {
          // Bildirim
          new Notification(msg.user || "Anonim", {
            body: msg.text,
          });

          // Ses
          try {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } catch {}
        }
      }
    });

    return () => socket.off("message");
  }, [allowed, username]);

  const joinChat = () => {
    if (!tempUser.trim()) return;
    setUsername(tempUser);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const msg = { user: username || "Anonim", text: message };
    socket.emit("message", msg);
    setMessage("");
  };

  return (
    <div style={{ padding: 20 }}>
      {/* Ses dosyası */}
      <audio ref={audioRef} src="/notify.mp3" />

      {!username ? (
        <div>
          <h2>Kullanıcı adı</h2>
          <input
            placeholder="Ad gir"
            value={tempUser}
            onChange={(e) => setTempUser(e.target.value)}
          />
          <button onClick={joinChat}>Giriş</button>

          {/* Bildirim Butonu */}
          <button onClick={requestNotification} style={{ marginLeft: 10 }}>
            🔔 Bildirim & Ses Aç
          </button>
        </div>
      ) : (
        <div>
          <h1>Chat</h1>

          {/* Bildirim & Ses Aç butonu her zaman görünsün */}
          <button onClick={requestNotification} style={{ marginBottom: 10 }}>
            🔔 Bildirim & Ses Aç
          </button>

          <div
            style={{
              border: "1px solid #ccc",
              padding: 10,
              minHeight: 300,
              overflowY: "auto",
            }}
          >
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.user}:</b> {m.text}
              </div>
            ))}
          </div>

          <input
            placeholder="Mesaj yaz..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: 200 }}
          />
          <button onClick={sendMessage}>Gönder</button>
        </div>
      )}
    </div>
  );
}

export default App;
