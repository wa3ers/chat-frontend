import React from 'react';

const Message = ({ message }) => {
  return (
    <div style={{ margin: '5px 0', padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}>
      <strong>{message.user}: </strong>{message.text}
    </div>
  );
};

export default Message;
