import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend1-aib9.onrender.com");

function App() {
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const audioRef = useRef(null);
  const originalTitle = useRef(document.title);
  const blinkInterval = useRef(null);

  // 🔔 Sayfa görünür olduğunda başlığı sıfırla
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) stopBlinking();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ✅ Socket mesajlarını dinle
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      if (msg.user !== username) {
        playNotify();
      }
    });

    return () => socket.off("chat message");
  }, [username]);

  // ✅ Bildirim sesi
  const playNotify = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } catch {}
    startBlinking();
  };

  // ✅ Başlık yanıp söner
  const startBlinking = () => {
    if (blinkInterval.current) return;

    blinkInterval.current = setInterval(() => {
      document.title =
        document.title === originalTitle.current ? "🔴 Yeni Mesaj!" : originalTitle.current;
    }, 700);
  };

  // ✅ Blink durdur
  const stopBlinking = () => {
    clearInterval(blinkInterval.current);
    blinkInterval.current = null;
    document.title = originalTitle.current;
  };

  // ✅ Mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username, text: message };
    socket.emit("chat message", msg);
    setMessage("");
    stopBlinking();
  };

  // ✅ Kullanıcı adı seçimi
  if (!username) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>İsmini gir:</h2>
        <input
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          placeholder="Kullanıcı adı..."
        />
        <button onClick={() => tempName && setUsername(tempName)}>Devam</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Chat</h1>

      {/* ses dosyası */}
      <audio ref={audioRef} src="/notify.mp3" preload="auto" />

      <div
        style={{
          border: "1px solid #ccc",
          height: "400px",
          overflowY: "scroll",
          padding: "1rem",
        }}
      >
        {chat.map((c, i) => (
          <div key={i}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: "10px" }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
          style={{ width: "250px" }}
        />
        <button type="submit">Gönder</button>
      </form>
    </div>
  );
}

export default App;
