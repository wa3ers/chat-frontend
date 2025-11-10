import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import notifySound from "./notify.mp3";

const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Bildirim sesi
  const playNotification = () => {
    try {
      const audio = new Audio(notifySound);
      audio.play().catch(() => {});
    } catch (err) {
      console.log("Ses çalınamadı:", err);
    }
  };

  // Yeni mesaj geldiğinde
  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);

      // Eğer aktif pencerede değilsek bildirim çalsın
      if (!document.hasFocus()) {
        playNotification();
      }
    });

    return () => socket.off("message");
  }, []);

  // Scroll follow
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Kullanıcı adını onaylama
  const handleSetUsername = () => {
    if (!tempUsername.trim()) return;
    setUsername(tempUsername.trim());
  };

  // Mesaj gönderme
  const sendMessage = () => {
    if (!inputMessage.trim() || !username) return;

    const messageData = { user: username, text: inputMessage };
    socket.emit("message", messageData);
    setInputMessage("");
  };

  // Enter tuşu
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Username ekranı
  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Kullanıcı Adı</h2>
        <input
          type="text"
          placeholder="Adın..."
          value={tempUsername}
          onChange={(e) => setTempUsername(e.target.value)}
        />
        <button onClick={handleSetUsername}>Kaydet</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat</h1>

      {/* Mesajlar */}
      <div
        style={{
          width: "100%",
          height: "60vh",
          border: "1px solid black",
          overflowY: "auto",
          marginBottom: 10,
          padding: 10,
        }}
      >
        {messages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.user}:</strong> {msg.text}
          </p>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <input
        placeholder="Mesaj yaz..."
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        style={{ width: 200 }}
      />
      <button onClick={sendMessage}>Gönder</button>
    </div>
  );
}

export default App;
