import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => socket.off("chat message");
  }, []);

  const registerUser = () => {
    if (tempName.trim() === "") return;
    setUsername(tempName);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chat message", { user: username, text: message });
    setMessage("");
  };

  if (!username) {
    return (
      <div style={{ textAlign: "center", marginTop: "40px" }}>
        <h2>Kullanıcı Adı Seç</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Kullanıcı adı..."
        />
        <button onClick={registerUser}>Giriş</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Chat</h1>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "scroll",
          padding: "10px",
        }}
      >
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Mesaj yaz..."
      />
      <button onClick={sendMessage}>Gönder</button>
    </div>
  );
}

export default App;
