import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://chat-backend1-aib9.onrender.com";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
});

function App() {
  const [username, setUsername] = useState("");
  const [inputName, setInputName] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [notifEnabled, setNotifEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const audioRef = useRef(null);

  // Bildirim sesi yükle
  useEffect(() => {
    audioRef.current = new Audio("/notify.mp3");
  }, []);

  // 🔥 Socket bağlanınca
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Socket bağlandı"));
    socket.on("disconnect", () => console.log("❌ Socket koptu"));

    // Gelen mesaj
    socket.on("chatMessage", (data) => {
      setMessages((prev) => [...prev, data]);

      if (audioEnabled && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      if (notifEnabled && document.hidden) {
        new Notification(`${data.user}: ${data.text}`);
      }
    });

    return () => {
      socket.off("chatMessage");
    };
  }, [audioEnabled, notifEnabled]);

  // Bildirim izni
  const enableNotification = async () => {
    let perm = await Notification.requestPermission();
    if (perm === "granted") {
      setNotifEnabled(true);
    } else {
      alert("Bildirim izni verilmedi!");
    }
  };

  const enableSound = () => {
    setAudioEnabled(true);
  };

  // Mesaj gönderme
  const sendMessage = () => {
    if (!message.trim() || !username) return;
    const data = { user: username, text: message };
    socket.emit("chatMessage", data);
    setMessage("");
  };

  const startChat = () => {
    if (inputName.trim()) {
      setUsername(inputName.trim());
    }
  };

  return (
    <div style={{ padding: 20 }}>
      {!username ? (
        <div>
          <h2>Kullanıcı adını gir:</h2>
          <input
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <button onClick={startChat}>Başla</button>
        </div>
      ) : (
        <>
          <h1>Hoş geldin, {username}</h1>

          <button onClick={enableNotification}>🔔 Bildirim Aç</button>
          <button onClick={enableSound}>🔊 Ses Aç</button>

          <div
            style={{
              width: "100%",
              height: 400,
              border: "1px solid gray",
              overflowY: "auto",
              marginTop: 20,
              padding: 10,
            }}
          >
            {messages.map((m, i) => (
              <div key={i}>
                <b>{m.user}</b>: {m.text}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 10 }}>
            <input
              style={{ width: "80%" }}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mesaj yaz..."
            />
            <button onClick={sendMessage}>Gönder</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
