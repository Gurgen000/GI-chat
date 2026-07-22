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
        <div style={styles.emptyIconWrapper}>💬</div>
        <h2 style={styles.emptyTitle}>Добро пожаловать в GI Chat</h2>
        <p style={styles.emptySub}>
          Выберите диалог или создайте новую группу для начала общения
        </p>
      </div>
    );
  }

  const headerBg = currentGroup
    ? getColor(currentGroup.name)
    : getColor(currentChat || "U");

  return (
    <div style={styles.container}>
      {/* Шапка с эффектом размытия */}
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
              width: "42px",
              height: "42px",
              borderRadius: "14px",
              background: headerBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "700",
              color: "white",
              flexShrink: 0,
              boxShadow: `0 4px 15px ${headerBg}50`,
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
                color: currentGroup ? "#8b5cf6" : isOnline ? "#43b89c" : "#777",
              }}
            >
              {currentGroup
                ? `${currentGroup.members.length} участников`
                : isOnline
                  ? "• онлайн"
                  : "оффлайн"}
            </span>
          </div>
        </div>

        {currentChat && !currentGroup && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              style={styles.btnCall}
              onClick={() => setCallModal({ type: "audio" })}
              title="Аудиозвонок"
            >
              📞
            </button>
            <button
              style={styles.btnCall}
              onClick={() => setCallModal({ type: "video" })}
              title="Видеозвонок"
            >
              📹
            </button>
            <button
              style={{ ...styles.btnCall, color: "#ff6584" }}
              onClick={handleDeleteChat}
              title="Удалить чат"
            >
              🗑
            </button>
          </div>
        )}
      </div>

      {/* Сообщения с мягким свечением фонов */}
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

      {/* Индикатор печати */}
      {typingUser && !currentGroup && typingUser === currentChat && (
        <div style={styles.typing}>печатает...</div>
      )}

      {/* Поле ввода со стеклянным стилем */}
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
                    ✕
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

      {/* Модалки */}
      {showProfile && currentChat && (
        <UserProfile
          username={currentChat}
          onClose={() => setShowProfile(false)}
        />
      )}

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
    background: "#0c0c12",
    position: "relative",
  },
  empty: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background:
      "radial-gradient(circle at center, rgba(108, 99, 255, 0.05) 0%, transparent 70%), #0c0c12",
  },
  emptyIconWrapper: {
    fontSize: "48px",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "20px",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  emptyTitle: {
    fontSize: "20px",
    color: "#f1f1f1",
    fontWeight: "600",
    margin: 0,
  },
  emptySub: {
    fontSize: "13px",
    color: "#666677",
    maxWidth: "300px",
    textAlign: "center",
  },
  header: {
    padding: "14px 20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
    background: "rgba(18, 18, 26, 0.75)",
    backdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chatName: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#f1f1f1",
    margin: 0,
  },
  status: { fontSize: "12px", marginTop: "2px", display: "block" },
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: `radial-gradient(circle at 10% 20%, rgba(108, 99, 255, 0.08) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(255, 101, 132, 0.06) 0%, transparent 40%), #0c0c12`,
  },
  typing: {
    padding: "6px 20px",
    fontSize: "12px",
    color: "#6c63ff",
    fontStyle: "italic",
  },
  inputArea: {
    padding: "14px 20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "rgba(18, 18, 26, 0.75)",
    backdropFilter: "blur(12px)",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: "12px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "white",
    fontSize: "14px",
    outline: "none",
    transition: "border 0.2s",
  },
  btnSend: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
  },
  btnEmoji: {
    fontSize: "20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "10px",
    opacity: 0.8,
    transition: "opacity 0.2s",
  },
  btnCall: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    width: "36px",
    height: "36px",
    fontSize: "15px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#f1f1f1",
  },
  emojiPicker: {
    position: "absolute",
    bottom: "75px",
    left: "20px",
    zIndex: 100,
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    borderRadius: "16px",
    overflow: "hidden",
  },
  previewContainer: {
    position: "absolute",
    bottom: "75px",
    left: "20px",
    background: "rgba(26, 26, 36, 0.95)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    zIndex: 100,
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  previewImage: {
    maxWidth: "240px",
    maxHeight: "180px",
    borderRadius: "12px",
    objectFit: "cover",
  },
  previewButtons: { display: "flex", gap: "8px" },
  btnSendImage: {
    flex: 1,
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
    color: "white",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  btnCancelImage: {
    padding: "8px 12px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "13px",
  },
  blockedMessage: {
    flex: 1,
    textAlign: "center",
    color: "#888",
    fontSize: "13px",
    padding: "10px",
  },
};
