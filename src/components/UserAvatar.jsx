import React from "react";

const colors = [
  "#4CAF50", "#2196F3", "#9C27B0", "#FF9800", "#E91E63", "#009688"
];

function getColor(name) {
  const code = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return colors[code % colors.length];
}

export default function UserAvatar({ name, imageUrl, size = 40 }) {
  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: "#ccc",
    objectFit: "cover",
    border: "2px solid #0b8079",
  };

  // 🧠 Eğer imageUrl varsa direkt resmi göster
  if (imageUrl && imageUrl.trim() !== "") {
    return <img src={imageUrl} alt={name || "avatar"} style={style} />;
  }

  // 📍 Resim yoksa baş harfli renkli avatar göster
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  const color = getColor(name || "user");
  const initialsStyle = {
    ...style,
    backgroundColor: color,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: size / 2,
  };

  return <div style={initialsStyle}>{initials}</div>;
}
