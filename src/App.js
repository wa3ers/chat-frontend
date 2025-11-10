import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";

const socket = io("https://chat-backend-cisd.onrender.com");

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [username, setUsername] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const audioRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(false);

  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prevChat) => [...prevChat, msg]);

      // Ses izni varsa çal
      if (soundEnabled && audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    });

    return () => socket.off("chat message");
  }, [soundEnabled]);

  const enableSound = () => {
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setSoundEnabled(true);
        })
        .catch(() => {
          alert("Önce kullanıcı etkileşimi gerekli!");
        });
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    socket.emit("chat message", { user: username || "Anonim", text: message });
    setMessage("");
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (username.trim() === "") return;
    setNameSet(true);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <audio ref={audioRef} src="/notify.mp3" />

      {!nameSet ? (
        <form onSubmit={handleNameSubmit}>
          <h2>Kullanıcı adını gir</h2>
          <input
            type="text"
            placeholder="Adınız..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button type="submit">Kaydet</button>
        </form>
      ) : (
        <>
          {!soundEnabled && (
            <button onClick={enableSound} style={{ marginBottom: "1rem" }}>
              🔔 Bildirim Sesini Aç
            </button>
          )}

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
        </>
      )}
    </div>
  );
}

export default App;
