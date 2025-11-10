import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState("");
  const [isReady, setIsReady] = useState(false);

  // Bildirim izni iste
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Mesaj listener
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // Bildirim oluştur
      if (Notification.permission === "granted") {
        new Notification(`${msg.user}`, {
          body: msg.text,
        });
      }
    });

    return () => socket.off("chat message");
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username, text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  const handleJoin = () => {
    if (!username.trim()) return;
    setIsReady(true);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      {!isReady ? (
        <div style={{ maxWidth: "240px", margin: "auto", textAlign: "center" }}>
          <h2>Kullanıcı Adı</h2>
          <input
            type="text"
            placeholder="Adınızı yazın..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
          <button
            onClick={handleJoin}
            style={{ padding: "8px 16px", cursor: "pointer" }}
          >
            Giriş
          </button>
        </div>
      ) : (
        <>
          <h1>Chat</h1>
          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              height: "320px",
              overflowY: "scroll",
              marginBottom: "1rem",
            }}
          >
            {chat.map((c, i) => (
              <div key={i} style={{ marginBottom: "6px" }}>
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
              style={{
                width: "75%",
                padding: "8px",
                marginRight: "6px",
              }}
            />
            <button type="submit" style={{ padding: "8px 16px" }}>
              Gönder
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default App;
