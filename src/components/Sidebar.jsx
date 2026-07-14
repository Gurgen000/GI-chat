import { useState } from "react";
import useStore from "../store/useStore";
import UserItem from "./UserItem";
import CreateGroup from "./CreateGroup";
import Settings from "../pages/Settings";

export default function Sidebar({
  onOpenChat,
  onOpenGroup,
  onCreateGroup,
  onLogout,
}) {
  const { user, users, onlineUsers, currentChat, currentGroup, groups } =
    useStore();
  const [search, setSearch] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [tab, setTab] = useState("chats");
  const [showSettings, setShowSettings] = useState(false);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const getInitials = (name) => name.slice(0, 2).toUpperCase();

  const getColor = (name) => {
    const colors = [
      "#6c63ff",
      "#ff6584",
      "#43b89c",
      "#f7b731",
      "#fc5c65",
      "#45aaf2",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div style={styles.container}>
      {/* Шапка */}
      <div style={styles.header}>
        <div style={styles.profile}>
          <div
            style={{
              ...styles.avatarCircle,
              background: getColor(user?.username || "U"),
            }}
          >
            {getInitials(user?.username || "U")}
          </div>
          <div>
            <div style={styles.username}>{user?.username}</div>
            <div style={styles.onlineStatus}>🟢 онлайн</div>
          </div>
        </div>
        <button
          style={styles.btnSettings}
          onClick={() => setShowSettings(true)}
        >
          ⚙️
        </button>
      </div>

      {/* Поиск */}
      <div style={styles.searchBox}>
        <input
          style={styles.searchInput}
          placeholder="🔍 Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Табы */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(tab === "chats" ? styles.tabActive : {}),
          }}
          onClick={() => setTab("chats")}
        >
          💬 Чаты
        </button>
        <button
          style={{
            ...styles.tab,
            ...(tab === "groups" ? styles.tabActive : {}),
          }}
          onClick={() => setTab("groups")}
        >
          👥 Группы
        </button>
      </div>

      {/* Список */}
      <div style={styles.list}>
        {tab === "chats" && (
          <>
            {filteredUsers.length === 0 && (
              <p style={styles.empty}>Нет пользователей</p>
            )}
            {filteredUsers.map((u) => (
              <UserItem
                key={u.username}
                user={u}
                isOnline={onlineUsers.includes(u.username)}
                isActive={currentChat === u.username}
                onClick={() => onOpenChat(u.username)}
                getColor={getColor}
                getInitials={getInitials}
              />
            ))}
          </>
        )}

        {tab === "groups" && (
          <>
            <button
              style={styles.btnNewGroup}
              onClick={() => setShowCreateGroup(true)}
            >
              + Создать группу
            </button>
            {filteredGroups.length === 0 && (
              <p style={styles.empty}>Нет групп</p>
            )}
            {filteredGroups.map((g) => (
              <div
                key={g.id}
                style={{
                  ...styles.groupItem,
                  background:
                    currentGroup?.id === g.id ? "#1e1e2e" : "transparent",
                }}
                onClick={() => onOpenGroup(g)}
              >
                <div
                  style={{
                    ...styles.avatarCircle,
                    background: getColor(g.name),
                    fontSize: "16px",
                  }}
                >
                  {getInitials(g.name)}
                </div>
                <div style={styles.groupInfo}>
                  <div style={styles.groupName}>{g.name}</div>
                  <div style={styles.groupMembers}>
                    {g.members.length} участников
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {showCreateGroup && (
        <CreateGroup
          onClose={() => setShowCreateGroup(false)}
          onCreateGroup={onCreateGroup}
        />
      )}

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

const styles = {
  container: {
    width: "300px",
    background: "#141414",
    borderRight: "1px solid #2a2a2a",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid #2a2a2a",
    background: "#141414",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatarCircle: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "white",
    flexShrink: 0,
  },
  username: {
    fontWeight: "600",
    color: "white",
    fontSize: "14px",
  },
  onlineStatus: {
    fontSize: "11px",
    color: "#4caf50",
    marginTop: "2px",
  },
  btnLogout: {
    padding: "6px 14px",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "12px",
  },
  searchBox: {
    padding: "12px 16px",
    borderBottom: "1px solid #2a2a2a",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #2a2a2a",
    background: "#1a1a1a",
    color: "white",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  tabs: {
    display: "flex",
    padding: "8px",
    gap: "6px",
    borderBottom: "1px solid #2a2a2a",
  },
  tab: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },
  tabActive: {
    background: "#1e1e2e",
    color: "white",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px",
  },
  empty: {
    textAlign: "center",
    color: "#444",
    padding: "20px",
    fontSize: "13px",
  },
  btnNewGroup: {
    width: "100%",
    padding: "10px",
    borderRadius: "10px",
    border: "1px dashed #2a2a2a",
    background: "transparent",
    color: "#6c63ff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  groupItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  btnSettings: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#888",
    cursor: "pointer",
    fontSize: "14px",
  },
  groupInfo: { flex: 1 },
  groupName: { fontWeight: "500", fontSize: "14px", color: "white" },
  groupMembers: { fontSize: "12px", color: "#888", marginTop: "2px" },
};
