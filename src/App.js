import { useState, useEffect } from "react";
import io from "socket.io-client";

// ✅ Backend URL
const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [permission, setPermission] = useState(false);

  // ✅ Bildirim + Ses
  const notify = (text) => {
    try {
      const audio = new Audio("/notify.mp3");
      audio.play().catch(() => {});
    } catch (e) {}

    if (Notification.permission === "granted") {
      new Notification("Yeni mesaj", { body: text });
    }
  };

  const requestPermission = () => {
    Notification.requestPermission().then((result) => {
      if (result === "granted") {
        setPermission(true);
      }
    });
  };

  // ✅ Mesaj alma
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // Kullanıcının kendi mesajı değilse bildirim
      if (msg.user !== username) {
        notify(msg.text);
      }
    });

    return () => socket.off("chat message");
  }, [username]);

  // ✅ Mesaj yolla
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username || "Anonim", text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // ✅ Kullanıcı adı yoksa giriş ekranı
  if (!username) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Adınızı girin</h2>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />

        <button onClick={() => setUsername(tempName || "Anonim")}>
          Giriş
        </button>

        {!permission && (
          <button
            style={{ marginLeft: "10px" }}
            onClick={requestPermission}
          >
            🔔 Bildirim & Ses Aç
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Chat</h1>

      {!permission && (
        <button onClick={requestPermission}>🔔 Bildirim & Ses Aç</button>
      )}

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "300px",
          overflowY: "scroll",
          marginBottom: "1rem",
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
          style={{ width: "250px" }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj..."
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
