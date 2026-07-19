import { useState, useEffect, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import useStore from "../store/useStore";
import Message from "./Message";
import UserProfile from "./UserProfile";
import CallModal from "./CallModal";

export default function ChatWindow({
  onSendMessage,
  onTyping,
  onStopTyping,
  socket,
}) {
  const {
    user,
    currentChat,
    currentGroup,
    messages,
    typingUser,
    onlineUsers,
    blockedUsers,
  } = useStore();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [callModal, setCallModal] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("call_offer", ({ from, signal, callType }) => {
      setIncomingCall({ from, signal, callType });
    });

    socket.on("message_deleted", ({ messageId }) => {
      useStore.getState().deleteMessage(messageId);
    });

    socket.on("chat_deleted", ({ with: deletedWith }) => {
      const currentChat = useStore.getState().currentChat;
      if (currentChat === deletedWith) {
        useStore.getState().clearMessages();
      }
    });

    return () => {
      socket.off("call_offer");
      socket.off("message_deleted");
      socket.off("chat_deleted");
    };
  }, [socket]);

  const handleSend = () => {
    if (!text.trim() || !currentChat) return;
    onSendMessage(text.trim(), "text");
    setText("");
    onStopTyping(currentChat);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!currentChat) return;
    onTyping(currentChat);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      onStopTyping(currentChat);
    }, 1500);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview({ file, url: ev.target.result });
    };
    reader.readAsDataURL(file);
    fileRef.current.value = "";
  };

  const sendImage = async () => {
    if (!imagePreview) return;
    const formData = new FormData();
    formData.append("image", imagePreview.file);
    try {
      const res = await fetch(
        "https://gi-chat-production.up.railway.app/api/upload",
        { method: "POST", body: formData },
      );
      const data = await res.json();
      if (data.success) {
        onSendMessage(data.url, "image");
        setImagePreview(null);
      }
    } catch (e) {
      console.error("Ошибка загрузки фото", e);
    }
  };

  const handleDeleteMessage = (messageId, onlyMe = false) => {
    if (onlyMe) {
      useStore.getState().deleteMessage(messageId);
    } else {
      socket.emit("delete_message", {
        messageId,
        to: currentChat,
      });
    }
  };

  const handleDeleteChat = () => {
    if (window.confirm("Удалить весь чат?")) {
      socket.emit("delete_chat", {
        user1: user.username,
        user2: currentChat,
      });
    }
  };

  const getInitials = (name) => name?.slice(0, 2).toUpperCase() || "U";

  const getColor = (name) => {
    const colors = [
      "#6c63ff",
      "#ff6584",
      "#43b89c",
      "#f7b731",
      "#fc5c65",
      "#45aaf2",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const isOnline = onlineUsers.includes(currentChat);

  if (!currentChat && !currentGroup) {
    return (
      <div style={styles.empty}>
        <span style={styles.emptyIcon}>💬</span>
        <h2 style={styles.emptyTitle}>Добро пожаловать в GI Chat!</h2>
        <p style={styles.emptySub}>Выбери пользователя чтобы начать общение</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Шапка */}
      <div style={styles.header}>
        <div
          style={{
            ...styles.headerInfo,
            cursor: currentChat ? "pointer" : "default",
          }}
          onClick={() => currentChat && setShowProfile(true)}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: currentGroup
                ? getColor(currentGroup.name)
                : getColor(currentChat || "U"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "700",
              color: "white",
              flexShrink: 0,
            }}
          >
            {currentGroup
              ? getInitials(currentGroup.name)
              : getInitials(currentChat || "U")}
          </div>
          <div>
            <h3 style={styles.chatName}>
              {currentGroup ? currentGroup.name : currentChat}
            </h3>
            <span
              style={{
                ...styles.status,
                color: currentGroup ? "#6c63ff" : isOnline ? "#4caf50" : "#888",
              }}
            >
              {currentGroup
                ? `${currentGroup.members.length} участников`
                : isOnline
                  ? "онлайн"
                  : "оффлайн"}
            </span>
          </div>
        </div>

        {currentChat && !currentGroup && (
          <div style={{ display: "flex", gap: "10px", marginRight: "16px" }}>
            <button
              style={styles.btnCall}
              onClick={() => setCallModal({ type: "audio" })}
            >
              📞
            </button>
            <button
              style={styles.btnCall}
              onClick={() => setCallModal({ type: "video" })}
            >
              📹
            </button>
            <button
              style={{ ...styles.btnCall, fontSize: "14px" }}
              onClick={handleDeleteChat}
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* Сообщения */}
      <div style={styles.messages}>
        {messages
          .filter((m) =>
            currentGroup
              ? m.groupId === currentGroup.id
              : (m.from === user.username && m.to === currentChat) ||
                (m.from === currentChat && m.to === user.username),
          )
          .map((msg, i) => (
            <Message
              key={i}
              msg={msg}
              isSent={msg.from === user.username}
              onDelete={handleDeleteMessage}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Печатает */}
      {typingUser && !currentGroup && typingUser === currentChat && (
        <div style={styles.typing}>печатает...</div>
      )}

      {/* Поле ввода */}
      <div style={styles.inputArea}>
        {blockedUsers.includes(currentChat) ? (
          <div style={styles.blockedMessage}>
            🚫 Вы заблокировали этого пользователя
          </div>
        ) : (
          <>
            {showEmoji && (
              <div style={styles.emojiPicker}>
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={(e) => {
                    setText((prev) => prev + e.emoji);
                    setShowEmoji(false);
                  }}
                />
              </div>
            )}

            {imagePreview && (
              <div style={styles.previewContainer}>
                <img
                  src={imagePreview.url}
                  alt="превью"
                  style={styles.previewImage}
                />
                <div style={styles.previewButtons}>
                  <button style={styles.btnSendImage} onClick={sendImage}>
                    Отправить ➤
                  </button>
                  <button
                    style={styles.btnCancelImage}
                    onClick={() => setImagePreview(null)}
                  >
                    Отмена ✕
                  </button>
                </div>
              </div>
            )}

            <button
              style={styles.btnEmoji}
              onClick={() => setShowEmoji(!showEmoji)}
            >
              😊
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileRef}
              onChange={handleImageUpload}
            />
            <button
              style={styles.btnEmoji}
              onClick={() => fileRef.current.click()}
            >
              🖼
            </button>
            <input
              style={styles.input}
              placeholder="Написать сообщение..."
              value={text}
              onChange={handleTyping}
              onKeyPress={handleKey}
            />
            <button style={styles.btnSend} onClick={handleSend}>
              ➤
            </button>
          </>
        )}
      </div>

      {/* Профиль */}
      {showProfile && currentChat && (
        <UserProfile
          username={currentChat}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* Исходящий звонок */}
      {callModal && (
        <CallModal
          callType={callModal.type}
          isIncoming={false}
          socket={socket}
          currentUser={user.username}
          currentChat={currentChat}
          onClose={() => setCallModal(null)}
        />
      )}

      {/* Входящий звонок */}
      {incomingCall && (
        <CallModal
          callType={incomingCall.callType}
          callerName={incomingCall.from}
          isIncoming={true}
          socket={socket}
          currentUser={user.username}
          currentChat={currentChat}
          incomingSignal={incomingCall.signal}
          onClose={() => setIncomingCall(null)}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    background: "#0f0f0f",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    color: "#444",
  },
  emptyIcon: { fontSize: "60px" },
  emptyTitle: { fontSize: "22px", color: "#666" },
  emptySub: { fontSize: "14px" },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #2a2a2a",
    background: "#141414",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 4px",
  },
  chatName: { fontSize: "15px", fontWeight: "600", color: "white", margin: 0 },
  status: { fontSize: "12px" },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: `radial-gradient(ellipse at top left, rgba(108, 99, 255, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(255, 101, 132, 0.05) 0%, transparent 50%), #0f0f0f`,
  },
  typing: {
    padding: "8px 20px",
    fontSize: "12px",
    color: "#6c63ff",
    fontStyle: "italic",
  },
  inputArea: {
    padding: "16px 20px",
    borderTop: "1px solid #2a2a2a",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    background: "#141414",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "24px",
    border: "1px solid #2a2a2a",
    background: "#1a1a1a",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  btnSend: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    color: "white",
    fontSize: "18px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnEmoji: {
    fontSize: "22px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
  },
  btnCall: {
    background: "#1e1e2e",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "80px",
    left: "20px",
    zIndex: 100,
  },
  previewContainer: {
    position: "absolute",
    bottom: "80px",
    left: "20px",
    background: "#1e1e1e",
    borderRadius: "16px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 100,
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
  },
  previewImage: {
    maxWidth: "250px",
    maxHeight: "200px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  previewButtons: { display: "flex", gap: "8px" },
  btnSendImage: {
    flex: 1,
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  btnCancelImage: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid #444",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
  },
  blockedMessage: {
    flex: 1,
    textAlign: "center",
    color: "#888",
    fontSize: "14px",
    padding: "12px",
  },
};
