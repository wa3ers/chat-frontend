import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com", {
  transports: ["websocket"],
});

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Bildirim için
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const audio = new Audio("/notify.mp3");

  // İlk giriş → isim sor
  const handleSetName = () => {
    if (!tempName.trim()) return;
    setUsername(tempName.trim());
  };

  // socket dinleme
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // Bildirim + ses
      if (notifyEnabled) {
        try {
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } catch {}
        if (document.hidden) {
          new Notification(`${msg.user}`, {
            body: msg.text,
          });
        }
      }
    });

    return () => socket.off("chat message");
  }, [notifyEnabled]);

  // mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username || "Anonim", text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // bildirim aç
  const enableNotification = () => {
    Notification.requestPermission().then((res) => {
      if (res === "granted") {
        setNotifyEnabled(true);
        audio.play().catch(() => {});
      } else {
        alert("İzin verilmedi!");
      }
    });
  };

  // Username ekranı
  if (!username) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Kullanıcı Adı:</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Ad..."
        />
        <button onClick={handleSetName}>Giriş</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      {/* Bildirim butonu */}
      {!notifyEnabled && (
        <button
          onClick={enableNotification}
          style={{
            padding: 10,
            background: "orange",
            marginBottom: 15,
            borderRadius: 8,
          }}
        >
          🔔 Bildirim & Ses Aç
        </button>
      )}

      <h2>Merhaba {username}</h2>

      <div
        style={{
          border: "1px solid gray",
          height: 300,
          overflowY: "scroll",
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
