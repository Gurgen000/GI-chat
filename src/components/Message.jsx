import { useState } from "react";

export default function Message({ msg, isSent, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  const time = new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const imageUrl = msg.text?.replace(
    "http://localhost:4000",
    "https://gi-chat-production.up.railway.app",
  );

  const isImage =
    msg.type === "image" ||
    msg.text?.startsWith("http://localhost:4000/uploads/") ||
    msg.text?.startsWith("https://gi-chat-production.up.railway.app/uploads/");

  const ReadStatus = () => {
    if (!isSent) return null;
    return (
      <span style={{ marginLeft: "4px", fontSize: "11px" }}>
        {msg.read ? (
          <span style={{ color: "#43b89c" }}>✓✓</span>
        ) : (
          <span style={{ color: "rgba(255,255,255,0.5)" }}>✓</span>
        )}
      </span>
    );
  };

  return (
    <div
      style={{
        ...styles.container,
        alignSelf: isSent ? "flex-end" : "flex-start",
        animation: "fadeIn 0.2s ease",
        position: "relative",
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowMenu(true);
      }}
    >
      <div
        style={{
          ...styles.bubble,
          background: isSent
            ? "linear-gradient(135deg, #6c63ff, #8b5cf6)"
            : "#1e1e2e",
          borderBottomRightRadius: isSent ? "4px" : "18px",
          borderBottomLeftRadius: isSent ? "18px" : "4px",
          padding: isImage ? "6px" : "10px 14px",
          boxShadow: isSent
            ? "0 2px 8px rgba(108, 99, 255, 0.3)"
            : "0 2px 8px rgba(0, 0, 0, 0.3)",
        }}
      >
        {isImage ? (
          <img
            src={imageUrl}
            alt="фото"
            style={styles.image}
            onClick={() => window.open(imageUrl, "_blank")}
          />
        ) : (
          <p style={styles.text}>{msg.text}</p>
        )}
        <div style={styles.footer}>
          <span style={styles.time}>{time}</span>
          <ReadStatus />
        </div>
      </div>

      {/* Меню удаления */}
      {showMenu && (
        <div
          style={{
            ...styles.menu,
            right: isSent ? "0" : "auto",
            left: isSent ? "auto" : "0",
          }}
        >
          {isSent && (
            <button
              style={styles.menuItem}
              onClick={() => {
                onDelete(msg._id);
                setShowMenu(false);
              }}
            >
              🗑 Удалить у всех
            </button>
          )}
          <button
            style={styles.menuItem}
            onClick={() => {
              onDelete(msg._id, true);
              setShowMenu(false);
            }}
          >
            🗑 Удалить у меня
          </button>
          <button
            style={{ ...styles.menuItem, color: "#888" }}
            onClick={() => setShowMenu(false)}
          >
            Отмена
          </button>
        </div>
      )}

      {/* Закрытие меню при клике вне */}
      {showMenu && (
        <div style={styles.overlay} onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    maxWidth: "65%",
  },
  bubble: {
    borderRadius: "18px",
    transition: "all 0.2s ease",
  },
  text: {
    fontSize: "14px",
    color: "white",
    lineHeight: "1.6",
    margin: 0,
    wordBreak: "break-word",
  },
  image: {
    maxWidth: "250px",
    maxHeight: "300px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "block",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "2px",
    marginTop: "4px",
  },
  time: {
    fontSize: "10px",
    opacity: "0.6",
    color: "white",
  },
  menu: {
    position: "absolute",
    top: "100%",
    background: "#1e1e2e",
    borderRadius: "12px",
    padding: "8px",
    zIndex: 100,
    minWidth: "160px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    border: "1px solid #2a2a2a",
  },
  menuItem: {
    display: "block",
    width: "100%",
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    color: "#ff6584",
    cursor: "pointer",
    fontSize: "13px",
    textAlign: "left",
    borderRadius: "8px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
};
