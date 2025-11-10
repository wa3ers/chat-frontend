import { useState, useEffect } from "react";
import io from "socket.io-client";

// ✅ Backend URL
const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // ✅ Mesajları dinle
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  // ✅ Mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username, text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // ✅ Kullanıcı adı set
  const saveName = () => {
    if (!tempName.trim()) return;
    setUsername(tempName);
  };

  // ✅ Eğer isim girilmemişse → login ekranı göster
  if (!username) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h2>Kullanıcı Adı Belirle</h2>
        <input
          type="text"
          placeholder="Bir ad yaz..."
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          style={{ padding: 8, fontSize: 16 }}
        />
        <button onClick={saveName} style={{ padding: 8 }}>
          Sohbete Gir
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Hoş geldin {username}! 👋</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "300px",
          overflowY: "scroll",
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
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
