import { create } from "zustand";

const useStore = create((set) => ({
  // Авторизация
  user: null,
  token: null,
  setUser: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),

  // Пользователи
  users: [],
  onlineUsers: [],
  setUsers: (users) => set({ users }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),

  // Блокировки
  blockedUsers: [],
  setBlockedUsers: (blockedUsers) => set({ blockedUsers }),
  addBlock: (username) =>
    set((state) => ({
      blockedUsers: [...state.blockedUsers, username],
    })),
  removeBlock: (username) =>
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((u) => u !== username),
    })),

  // Группы
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  // Чат
  currentChat: null,
  currentGroup: null,
  messages: [],
  setCurrentChat: (currentChat) =>
    set({ currentChat, currentGroup: null, messages: [] }),
  setCurrentGroup: (currentGroup) =>
    set({ currentGroup, currentChat: null, messages: [] }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // Непрочитанные
  unread: {},
  addUnread: (from) =>
    set((state) => ({
      unread: { ...state.unread, [from]: (state.unread[from] || 0) + 1 },
    })),
  clearUnread: (username) =>
    set((state) => ({
      unread: { ...state.unread, [username]: 0 },
    })),

  // Печатает
  typingUser: null,
  setTypingUser: (typingUser) => set({ typingUser }),

  markMessagesRead: (from, to) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.from === from && m.to === to ? { ...m, read: true } : m,
      ),
    })),

    // удаления сообщений
  deleteMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((m) => m._id !== messageId),
    })),
  clearMessages: () => set({ messages: [] }),
}));

export default useStore;
