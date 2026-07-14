import { useState } from "react";
import useStore from "../store/useStore";

export default function Settings({ onClose }) {
  const { user, setUser, logout } = useStore();
  const [hideOnline, setHideOnline] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [name, setName] = useState(user?.username || "");
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setUser({ ...user, username: name, hideOnline, notifications });
    localStorage.setItem("hideOnline", hideOnline);
    localStorage.setItem("notifications", notifications);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>⚙️ Настройки</h2>
          <button style={styles.btnClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Профиль */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>👤 Профиль</div>
          <div style={styles.avatarBig}>{name.slice(0, 2).toUpperCase()}</div>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Твоё имя"
          />
        </div>

        {/* Приватность */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🔒 Приватность</div>

          <div style={styles.toggle}>
            <div>
              <div style={styles.toggleLabel}>Скрыть онлайн статус</div>
              <div style={styles.toggleDesc}>
                Другие не увидят когда ты онлайн
              </div>
            </div>
            <div
              style={{
                ...styles.toggleBtn,
                background: hideOnline ? "#6c63ff" : "#2a2a2a",
              }}
              onClick={() => setHideOnline(!hideOnline)}
            >
              <div
                style={{
                  ...styles.toggleCircle,
                  transform: hideOnline ? "translateX(20px)" : "translateX(0)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Уведомления */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>🔔 Уведомления</div>

          <div style={styles.toggle}>
            <div>
              <div style={styles.toggleLabel}>Push уведомления</div>
              <div style={styles.toggleDesc}>
                Получать уведомления о новых сообщениях
              </div>
            </div>
            <div
              style={{
                ...styles.toggleBtn,
                background: notifications ? "#6c63ff" : "#2a2a2a",
              }}
              onClick={() => setNotifications(!notifications)}
            >
              <div
                style={{
                  ...styles.toggleCircle,
                  transform: notifications
                    ? "translateX(20px)"
                    : "translateX(0)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div style={styles.buttons}>
          <button style={styles.btnSave} onClick={saveSettings}>
            {saved ? "✅ Сохранено!" : "Сохранить"}
          </button>
          <button style={styles.btnLogout} onClick={logout}>
            Выйти из аккаунта
          </button>
          <button
            style={styles.btnDelete}
            onClick={() => {
              if (window.confirm("Ты уверен? Аккаунт будет удалён навсегда!")) {
                fetch(
                  "https://gi-chat-production.up.railway.app/api/auth/delete",
                  {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: user.username }),
                  },
                ).then(() => logout());
              }
            }}
          >
            🗑 Удалить аккаунт
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    background: "#141414",
    borderRadius: "20px",
    padding: "24px",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    border: "1px solid #2a2a2a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
  },
  btnClose: {
    background: "transparent",
    border: "none",
    color: "#888",
    fontSize: "18px",
    cursor: "pointer",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    background: "#1a1a1a",
    borderRadius: "14px",
  },
  sectionTitle: {
    color: "#888",
    fontSize: "12px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  avatarBig: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "700",
    color: "white",
    alignSelf: "center",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    background: "#0f0f0f",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  toggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  toggleLabel: {
    color: "white",
    fontSize: "14px",
    fontWeight: "500",
  },
  toggleDesc: {
    color: "#888",
    fontSize: "12px",
    marginTop: "2px",
  },
  toggleBtn: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.3s",
    flexShrink: 0,
  },
  toggleCircle: {
    width: "20px",
    height: "20px",
    background: "white",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    left: "2px",
    transition: "transform 0.3s",
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  btnSave: {
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #ff6584)",
    color: "white",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnLogout: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ff6584",
    background: "transparent",
    color: "#ff6584",
    fontSize: "15px",
    cursor: "pointer",
  },
  btnDelete: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ff4444",
    background: "transparent",
    color: "#ff4444",
    fontSize: "15px",
    cursor: "pointer",
  },
};
