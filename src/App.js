import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    socket.on("message", (data) => {
      setMessages((prev) => [...prev, data]);

      if (permissionGranted) {
        audioRef.current?.play();

        new Notification(`${data.user}`, {
          body: data.text,
        });
      }
    });

    return () => {
      socket.off("message");
    };
  }, [permissionGranted]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { user: username, text: message });
    setMessage("");
  };

  const joinChat = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername);
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setPermissionGranted(true);
        audioRef.current?.play()
      } else {
        alert("Bildirim izni verilmedi.");
      }
    } catch (err) {
      console.error("Bildirim hatası:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />

      {!username ? (
        <div>
          <h2>Kullanıcı Adı</h2>
          <input
            type="text"
            placeholder="Ad"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
          />
          <button onClick={joinChat}>Giriş</button>
        </div>
      ) : (
        <>
          <h1>Chat</h1>

          {/* 🔔 Buton burada */}
          <button
            onClick={requestPermission}
            style={{
              padding: "10px 14px",
              marginBottom: 10,
              background: "#222",
              color: "#fff",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            🔔 Bildirim & Ses Aç
          </button>

          <div
            style={{
              width: "100%",
              height: 400,
              border: "1px solid gray",
              marginBottom: 10,
              overflowY: "scroll",
              padding: 10,
            }}
          >
            {messages.map((msg, idx) => (
              <p key={idx}>
                <b>{msg.user}:</b> {msg.text}
              </p>
            ))}
          </div>

          <input
            type="text"
            placeholder="Mesaj yaz..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: 200 }}
          />
          <button onClick={sendMessage}>Gönder</button>
        </>
      )}
    </div>
  );
}

export default App;
