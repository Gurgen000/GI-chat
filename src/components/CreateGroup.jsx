import { useState } from "react";
import useStore from "../store/useStore";

export default function CreateGroup({ onClose, onCreateGroup }) {
  const { users } = useStore();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState([]);

  const toggleUser = (username) => {
    setSelected((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username],
    );
  };

  const handleCreate = () => {
    if (!name.trim() || selected.length === 0) return;
    onCreateGroup(name.trim(), selected);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>👥 Создать группу</h3>

        <input
          style={styles.input}
          placeholder="Название группы..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p style={styles.label}>Выберите участников:</p>

        <div style={styles.usersList}>
          {users.map((u) => {
            const isSelected = selected.includes(u.username);
            return (
              <div
                key={u.username}
                style={{
                  ...styles.userItem,
                  background: isSelected
                    ? "rgba(108, 99, 255, 0.15)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: isSelected
                    ? "1px solid rgba(108, 99, 255, 0.4)"
                    : "1px solid transparent",
                }}
                onClick={() => toggleUser(u.username)}
              >
                <div style={styles.avatarMini}>
                  {u.username.slice(0, 2).toUpperCase()}
                </div>
                <span style={styles.username}>{u.username}</span>
                {isSelected && <span style={styles.check}>✓</span>}
              </div>
            );
          })}
        </div>

        <div style={styles.buttons}>
          <button style={styles.btnCancel} onClick={onClose}>
            Отмена
          </button>
          <button
            style={{
              ...styles.btnCreate,
              opacity: !name.trim() || selected.length === 0 ? 0.5 : 1,
            }}
            onClick={handleCreate}
            disabled={!name.trim() || selected.length === 0}
          >
            Создать
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
    background: "rgba(0, 0, 0, 0.75)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#14141e",
    borderRadius: "20px",
    padding: "24px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },
  title: {
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
  },
  input: {
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "white",
    fontSize: "14px",
    outline: "none",
  },
  label: {
    color: "#777788",
    fontSize: "12px",
    margin: 0,
  },
  usersList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    maxHeight: "180px",
    overflowY: "auto",
  },
  userItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  avatarMini: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "bold",
    color: "#fff",
  },
  username: {
    flex: 1,
    color: "white",
    fontSize: "13px",
  },
  check: {
    color: "#6c63ff",
    fontWeight: "700",
  },
  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "6px",
  },
  btnCancel: {
    flex: 1,
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
  },
  btnCreate: {
    flex: 1,
    padding: "10px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
    color: "white",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(108, 99, 255, 0.3)",
  },
};
