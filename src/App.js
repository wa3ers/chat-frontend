import { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Render’daki backend URL
const socket = io('https://chat-backend-cisd.onrender.com');

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
    });

    // Component unmount olduğunda listener'ı temizle
    return () => socket.off('chat message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    const msg = { user: 'Anonim', text: message };
    socket.emit('chat message', msg);
    setMessage('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>React Chat</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'scroll' }}>
        {chat.map((c, index) => (
          <div key={index}><b>{c.user}:</b> {c.text}</div>
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
