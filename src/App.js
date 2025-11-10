import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [inputUsername, setInputUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // Bildirim + Ses
      if (msg.user !== username) {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }

        if (Notification.permission === "granted") {
          new Notification(`${msg.user}: ${msg.text}`);
        }
      }
    });

    return () => socket.off("chat message");
  }, [username]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("chat message", { user: username, text: message });
    setMessage("");
  };

  const enableNotifications = () => {
    Notification.requestPermission();
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <audio ref={audioRef} src="/notify.mp3" />

      {!username ? (
        <div>
          <h2>Kullanıcı Adı Seç</h2>
          <input
            type="text"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            placeholder="Adın..."
          />
          <button onClick={() => setUsername(inputUsername)}>Giriş</button>
        </div>
      ) : (
        <>
          <h1>Chat | Merhaba {username}</h1>

          <button onClick={enableNotifications}>🔔 Bildirim & Ses Aç</button>

          <div
            style={{
              border: "1px solid #ccc",
              height: "300px",
              overflowY: "auto",
              marginTop: 10,
              padding: 10,
            }}
          >
            {chat.map((c, i) => (
              <div key={i}>
                <b>{c.user}: </b> {c.text}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesaj..."
            />
            <button type="submit">Gönder</button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
