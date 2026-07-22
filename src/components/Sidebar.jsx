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

  const userAvatarBg = getColor(user?.username || "U");

  return (
    <div style={styles.container}>
      {/* Шапка профиля */}
      <div style={styles.header}>
        <div style={styles.profile}>
          <div
            style={{
              ...styles.avatarCircle,
              background: userAvatarBg,
              boxShadow: `0 4px 12px ${userAvatarBg}40`,
            }}
          >
            {getInitials(user?.username || "U")}
          </div>
          <div>
            <div style={styles.username}>{user?.username}</div>
            {/* Оставили только красивую надпись со статусом */}
            <div style={styles.onlineStatus}>в сети</div>
          </div>
        </div>
        <button
          style={styles.btnSettings}
          onClick={() => setShowSettings(true)}
          title="Настройки"
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
              <p style={styles.empty}>Пользователи не найдены</p>
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
              + Создать новую группу
            </button>
            {filteredGroups.length === 0 && (
              <p style={styles.empty}>Группы не найдены</p>
            )}
            {filteredGroups.map((g) => {
              const groupBg = getColor(g.name);
              const isActive = currentGroup?.id === g.id;
              return (
                <div
                  key={g.id}
                  style={{
                    ...styles.groupItem,
                    background: isActive
                      ? "rgba(108, 99, 255, 0.15)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(108, 99, 255, 0.3)"
                      : "1px solid transparent",
                  }}
                  onClick={() => onOpenGroup(g)}
                >
                  <div
                    style={{
                      ...styles.avatarCircle,
                      background: groupBg,
                      boxShadow: `0 4px 12px ${groupBg}40`,
                      fontSize: "13px",
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
              );
            })}
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
    width: "320px",
    background: "#12121a",
    borderRight: "1px solid rgba(255, 255, 255, 0.06)",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarCircle: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
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
    color: "#43b89c",
    marginTop: "2px",
  },
  searchBox: {
    padding: "12px 16px",
  },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "white",
    fontSize: "13px",
    outline: "none",
    boxSizing: "border-box",
  },
  tabs: {
    display: "flex",
    padding: "0 16px 10px",
    gap: "6px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
  },
  tab: {
    flex: 1,
    padding: "8px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "#777788",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  tabActive: {
    background: "rgba(255, 255, 255, 0.08)",
    color: "white",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "8px 12px",
  },
  empty: {
    textAlign: "center",
    color: "#555566",
    padding: "20px",
    fontSize: "13px",
  },
  btnNewGroup: {
    width: "100%",
    padding: "10px",
    borderRadius: "12px",
    border: "1px dashed rgba(108, 99, 255, 0.4)",
    background: "rgba(108, 99, 255, 0.05)",
    color: "#6c63ff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "10px",
  },
  groupItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 0.2s",
    margin: "2px 0",
  },
  btnSettings: {
    padding: "8px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    background: "rgba(255, 255, 255, 0.03)",
    color: "#888",
    cursor: "pointer",
    fontSize: "14px",
  },
  groupInfo: { flex: 1, overflow: "hidden" },
  groupName: {
    fontWeight: "600",
    fontSize: "14px",
    color: "white",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  groupMembers: { fontSize: "12px", color: "#777788", marginTop: "2px" },
};
