import { useState, useEffect } from "react";
import io from "socket.io-client";

// ✅ BACKEND URL
const socket = io("https://chat-backend1-aib9.onrender.com");

// ✅ Ses dosyası
const notifySound = new Audio("/notify.mp3");

// ✅ Favicon değişim
let flashInterval = null;
const originalFavicon = "/favicon.ico";
const altFavicon = "/favicon-alert.ico";

function startFaviconFlash() {
  if (flashInterval) return;

  flashInterval = setInterval(() => {
    const favicon = document.querySelector("link[rel='icon']");
    if (!favicon) return;
    favicon.href = favicon.href.includes(originalFavicon)
      ? altFavicon
      : originalFavicon;
  }, 600);
}

function stopFaviconFlash() {
  clearInterval(flashInterval);
  flashInterval = null;

  const favicon = document.querySelector("link[rel='icon']");
  if (favicon) favicon.href = originalFavicon;
}

function App() {
  const [username, setUsername] = useState("");
  const [isReady, setIsReady] = useState(false);

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // ✅ İlk giriş ekranı
  const handleLogin = () => {
    if (!username.trim()) return;
    setIsReady(true);
    localStorage.setItem("username", username);
  };

  // ✅ Daha önce giriş yapılmışsa otomatik gir
  useEffect(() => {
    const saved = localStorage.getItem("username");
    if (saved) {
      setUsername(saved);
      setIsReady(true);
    }
  }, []);

  // ✅ Mesaj geldiğinde
  useEffect(() => {
    socket.on("chat message", (msg) => {
      setChat((prev) => [...prev, msg]);

      // ✅ Ses çal
      try {
        notifySound.play();
      } catch (e) {}

      // ✅ Favicon animasyonu başlat
      if (!document.hasFocus()) startFaviconFlash();
    });

    return () => socket.off("chat message");
  }, []);

  // ✅ Sekme görünür olunca favicon resetle
  useEffect(() => {
    const onFocus = () => stopFaviconFlash();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // ✅ Mesaj gönder
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const msg = { user: username || "Anonim", text: message };
    socket.emit("chat message", msg);
    setMessage("");
  };

  // ✅ Giriş ekranı
  if (!isReady) {
    return (
      <div style={styles.loginWrapper}>
        <div style={styles.loginBox}>
          <h2>Kullanıcı Adı</h2>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Kullanıcı adın..."
          />
          <button style={styles.button} onClick={handleLogin}>
            Giriş
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>Sohbet</h1>

      <div style={styles.chatBox}>
        {chat.map((c, index) => (
          <div key={index}>
            <b>{c.user}:</b> {c.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} style={styles.form}>
        <input
          style={styles.input}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Mesaj yaz..."
        />
        <button style={styles.button} type="submit">
          Gönder
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: { padding: "2rem", maxWidth: 600, margin: "auto" },

  chatBox: {
    border: "1px solid #ccc",
    padding: "1rem",
    height: "350px",
    overflowY: "scroll",
    marginBottom: "1rem",
  },

  form: { display: "flex", gap: "0.5rem" },
  input: {
    flex: 1,
    padding: "0.5rem",
    fontSize: "1rem",
  },
  button: {
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    cursor: "pointer",
  },

  loginWrapper: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  loginBox: {
    border: "1px solid #ccc",
    padding: "1.5rem",
    borderRadius: 8,
    textAlign: "center",
  },
};

export default App;
