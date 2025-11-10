import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempUser, setTempUser] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Bildirim izni iste
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Mesaj geldi
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // Eğer kullanıcı kendisi göndermediyse bildirim + ses çalsın
      if (msg.user !== username) {
        playNotify();
        showNotification(msg);
      }
    });

    return () => socket.off("chat message");
  }, [username]);

  const showNotification = (msg) => {
    if (Notification.permission === "granted") {
      new Notification(`${msg.user}`, {
        body: msg.text,
      });
    }
  };

  const playNotify = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => console.log("Ses engellendi:", e));
    }
  };

  const enableSound = () => {
    setSoundEnabled(true);
    if (audioRef.current) audioRef.current.play();
  };

  const joinChat = () => {
    if (!tempUser.trim()) return;
    setUsername(tempUser);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username, text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  if (!username) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Kullanıcı Adı Seç</h2>
        <input
          type="text"
          value={tempUser}
          onChange={(e) => setTempUser(e.target.value)}
        />
        <button onClick={joinChat}>Giriş</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Chat ({username})</h2>

      {!soundEnabled && (
        <button onClick={enableSound} style={{ marginBottom: "10px" }}>
          🔔 Bildirim Sesini Aç
        </button>
      )}

      <audio ref={audioRef} src="/notify.mp3" />

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "300px",
          overflowY: "auto",
        }}
      >
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Mesaj yaz..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
