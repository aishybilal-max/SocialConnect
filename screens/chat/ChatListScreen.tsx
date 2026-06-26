// screens/chat/ChatListScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { collection, onSnapshot, query, orderBy, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

export default function ChatListScreen({ navigation }: any) {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    const myId = auth.currentUser?.uid;
    if (!myId) return;

    const q = query(collection(db, "chats"), orderBy("updatedAt", "desc"));

    const unsub = onSnapshot(q, async (snap) => {
      const list: any[] = [];

      for (const chatDoc of snap.docs) {
        const data = chatDoc.data();
        if (!Array.isArray(data?.participants) || !data.participants.includes(myId)) continue;

        const otherUserId = data.participants.find((id: string) => id !== myId);
        let otherUsername = "Unknown";

        if (otherUserId) {
          try {
            const uSnap = await getDoc(doc(db, "users", otherUserId));
            if (uSnap.exists()) {
              otherUsername = uSnap.data()?.name || uSnap.data()?.username || "Unknown";
            }
          } catch {}
        }

        list.push({ id: chatDoc.id, ...data, otherUserId, otherUsername });
      }

      setChats(list);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Users")} style={styles.newBtn}>
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, chats.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate("Users")}>
              <Text style={styles.startBtnText}>Start a Chat</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Chat", {
                chatId: item.id,
                userId: item.otherUserId,
                username: item.otherUsername,
              })
            }
            style={styles.item}
            activeOpacity={0.85}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.otherUsername?.charAt(0)?.toUpperCase() || "U"}</Text>
            </View>

            <View style={styles.chatTextArea}>
              <Text style={styles.username}>{item.otherUsername}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMessage || "No messages yet"}
              </Text>
            </View>

            <Text style={styles.openText}>Open</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  headerTitle: {
    flex: 1,
    fontSize: theme.font.xl,
    fontWeight: "900",
    color: theme.colors.text,
  },
  newBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  newBtnText: {
    color: theme.colors.bg,
    fontSize: theme.font.sm,
    fontWeight: "900",
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    marginBottom: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: theme.font.lg,
  },
  chatTextArea: {
    flex: 1,
  },
  username: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: theme.font.md,
  },
  lastMsg: {
    color: theme.colors.textSub,
    fontSize: theme.font.sm,
    marginTop: 3,
  },
  openText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.md,
    marginBottom: 14,
  },
  startBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.md,
  },
  startBtnText: {
    color: theme.colors.bg,
    fontWeight: "900",
    fontSize: theme.font.sm,
  },
});
