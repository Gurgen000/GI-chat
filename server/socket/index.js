const Message = require("../models/Message");
const Group = require("../models/Group");
const { encrypt, decrypt } = require("../utils/crypto");

module.exports = (io) => {
  const onlineUsers = {};

  io.on("connection", (socket) => {
    socket.on("user_online", (username) => {
      onlineUsers[username] = socket.id;
      socket.username = username;
      io.emit("online_users", Object.keys(onlineUsers));
    });

    // Личное сообщение
    socket.on("private_message", async ({ to, text, from, type }) => {
      const encryptedText = type === "text" ? encrypt(text) : text;
      
      // ✅ Явно указываем read: false при отправке
      const msg = {
        from,
        to,
        text: encryptedText,
        type: type || "text",
        read: false,
        createdAt: new Date(),
      };

      let savedMsg;
      try {
        const newMsg = new Message(msg);
        savedMsg = await newMsg.save();
      } catch (e) {
        console.error("Ошибка сохранения сообщения:", e);
      }

      // Подготавливаем объект для отправки на клиент
      const decryptedMsg = { 
        ...msg, 
        _id: savedMsg ? savedMsg._id : Date.now().toString(),
        text: type === "text" ? text : text,
        read: false // ✅ Сообщение изначально ВСЕГДА не прочитано!
      };

      const recipientSocket = onlineUsers[to];
      if (recipientSocket)
        io.to(recipientSocket).emit("private_message", decryptedMsg);
      
      socket.emit("private_message", decryptedMsg);
    });

    // История личных сообщений
    socket.on("get_history", async ({ user1, user2 }) => {
      try {
        const messages = await Message.find({
          $or: [
            { from: user1, to: user2 },
            { from: user2, to: user1 },
          ],
        })
          .sort({ createdAt: 1 })
          .limit(100);

        const decrypted = messages.map((m) => ({
          ...m.toObject(),
          text:
            m.type === "text"
              ? decrypt(m.text)
              : m.text.replace(
                  "http://localhost:4000",
                  "https://gi-chat-production.up.railway.app",
                ),
        }));

        socket.emit("history", decrypted);

        // Отмечаем входящие сообщения как прочитанные только при открытии истории
        await Message.updateMany(
          { from: user2, to: user1, read: false },
          { read: true },
        );
        
        const senderSocket = onlineUsers[user2];
        if (senderSocket) {
          io.to(senderSocket).emit("messages_read", { from: user2, to: user1 });
        }
      } catch (e) {
        socket.emit("history", []);
      }
    });

    // Создать группу
    socket.on("create_group", async ({ name, members, creator }) => {
      try {
        const group = new Group({
          id: Date.now().toString(),
          name,
          members: [...members, creator],
          creator,
        });
        await group.save();

        const groupData = group.toObject();
        group.members.forEach((member) => {
          const memberSocket = onlineUsers[member];
          if (memberSocket)
            io.to(memberSocket).emit("group_created", groupData);
        });
      } catch (e) {}
    });

    // Получить группы
    socket.on("get_groups", async (username) => {
      try {
        const groups = await Group.find({ members: username });
        socket.emit("groups", groups);
      } catch (e) {
        socket.emit("groups", []);
      }
    });

    // Групповое сообщение
    socket.on("group_message", async ({ groupId, text, from, type }) => {
      try {
        const group = await Group.findOne({ id: groupId });
        if (!group) return;

        const encryptedText = type === "text" ? encrypt(text) : text;
        const msg = {
          groupId,
          from,
          text: encryptedText,
          type: type || "text",
          createdAt: new Date(),
        };
        await new Message(msg).save();

        const decryptedMsg = { ...msg, text: type === "text" ? text : text };
        group.members.forEach((member) => {
          const memberSocket = onlineUsers[member];
          if (memberSocket)
            io.to(memberSocket).emit("group_message", decryptedMsg);
        });
      } catch (e) {}
    });

    // История группы
    socket.on("get_group_history", async (groupId) => {
      try {
        const messages = await Message.find({ groupId })
          .sort({ createdAt: 1 })
          .limit(100);
        const decrypted = messages.map((m) => ({
          ...m.toObject(),
          text:
            m.type === "text"
              ? decrypt(m.text)
              : m.text.replace(
                  "http://localhost:4000",
                  "https://gi-chat-production.up.railway.app",
                ),
        }));
        socket.emit("group_history", decrypted);
      } catch (e) {
        socket.emit("group_history", []);
      }
    });

    // Печатает
    socket.on("typing", ({ to, from }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) io.to(recipientSocket).emit("typing", { from });
    });

    socket.on("stop_typing", ({ to, from }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) io.to(recipientSocket).emit("stop_typing", { from });
    });

    // Удалить сообщение
    socket.on("delete_message", async ({ messageId, to }) => {
      try {
        await Message.deleteOne({ _id: messageId });
        const recipientSocket = onlineUsers[to];
        if (recipientSocket) {
          io.to(recipientSocket).emit("message_deleted", { messageId });
        }
        socket.emit("message_deleted", { messageId });
      } catch (e) {}
    });

    // Удалить чат
    socket.on("delete_chat", async ({ user1, user2 }) => {
      try {
        await Message.deleteMany({
          $or: [
            { from: user1, to: user2 },
            { from: user2, to: user1 },
          ],
        });
        const recipientSocket = onlineUsers[user2];
        if (recipientSocket) {
          io.to(recipientSocket).emit("chat_deleted", { with: user1 });
        }
        socket.emit("chat_deleted", { with: user2 });
      } catch (e) {}
    });

    // Звонки
    socket.on("call_offer", ({ to, from, signal, callType }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) {
        io.to(recipientSocket).emit("call_offer", { from, signal, callType });
      }
    });

    socket.on("call_answer", ({ to, signal }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) {
        io.to(recipientSocket).emit("call_answer", { signal });
      }
    });

    socket.on("ice_candidate", ({ to, candidate }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) {
        io.to(recipientSocket).emit("ice_candidate", { candidate });
      }
    });

    socket.on("end_call", ({ to }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) {
        io.to(recipientSocket).emit("call_ended");
      }
    });

    socket.on("reject_call", ({ to }) => {
      const recipientSocket = onlineUsers[to];
      if (recipientSocket) {
        io.to(recipientSocket).emit("call_rejected");
      }
    });

    // Отметить сообщения как прочитанные
    socket.on("mark_read", async ({ from, to }) => {
      try {
        await Message.updateMany({ from, to, read: false }, { read: true });
        const senderSocket = onlineUsers[from];
        if (senderSocket) {
          io.to(senderSocket).emit("messages_read", { from, to });
        }
      } catch (e) {}
    });

    socket.on("disconnect", () => {
      if (socket.username) {
        delete onlineUsers[socket.username];
        io.emit("online_users", Object.keys(onlineUsers));
      }
    });
  });
};