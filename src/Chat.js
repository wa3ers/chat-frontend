import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const name = prompt('Kullanıcı adınızı girin:');
    setUser(name || 'Anonim');

    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off('chat message');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const msg = { user, text: input };
    socket.emit('chat message', msg);
    setInput('');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto' }}>
      <div
        style={{
          border: '1px solid #ccc',
          height: '400px',
          padding: '10px',
          overflowY: 'auto',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}: </strong> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '80%', padding: '10px' }}
          placeholder="Mesaj yazın..."
        />
        <button style={{ width: '18%', padding: '10px' }}>Gönder</button>
      </form>
    </div>
  );
}

export default Chat;
