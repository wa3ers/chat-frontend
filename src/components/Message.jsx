import UserAvatar from "./UserAvatar";

export default function Message({ name, text, avatar, time, isMe }) {
  return (
    <div style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
      {!isMe && <UserAvatar src={avatar} />}

      <div className="msg-bubble">
        <strong>{name}</strong>
        <p>{text}</p>
        <small>{time}</small>
      </div>

      {isMe && <UserAvatar src={avatar} />}
    </div>
  );
}
