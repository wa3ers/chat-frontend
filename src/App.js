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

    return () => {
      socket.off("chat message");
    };
  }, []);

  const saveName = () => {
    if (tempName.trim() === "") return;
    setUsername(tempName);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const msg = {
      user: username || "Anonim",
      text: message,
    };

    socket.emit("chat message", msg);
    setMessage("");
  };

  if (!username) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Kullanıcı adı gir</h2>
        <input
          type="text"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <button onClick={saveName}>Kaydet</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>React Chat</h1>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {chat.map((c, index) => (
          <div key={index}>
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
