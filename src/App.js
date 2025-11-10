import { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Render’daki backend URL’si
const socket = io('https://chat-backend-cisd.onrender.com'); // Bunu kendi Render backend URL’inle değiştir

function App() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Backend’den gelen mesajları dinle
    socket.on('chat message', (msg) => {
      setChat((prevChat) => [...prevChat, msg]);
    });

    // Cleanup: component unmount olduğunda listener’ı kaldır
    return () => socket.off('chat message');
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;

    const msg = { user: 'Anonim', text: message };
    socket.emit('chat message', msg); // Mesajı backend’e gönder
    setMessage('');
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>React Chat</h1>
      <div
        style={{
          border: '1px solid #ccc',
          padding: '1rem',
          height: '300px',
          overflowY: 'scroll',
          marginBottom: '1rem',
          backgroundColor: '#f9f9f9',
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
          style={{ padding: '0.5rem', width: '70%', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Gönder
        </button>
      </form>
    </div>
  );
}

export default App;
