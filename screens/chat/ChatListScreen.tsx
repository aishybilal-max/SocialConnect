// screens/chat/ChatListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Image,
} from "react-native";
import {
  collection, onSnapshot, query, orderBy, doc, getDoc,
} from "firebase/firestore";
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
        let otherPhotoURL = "";
        if (otherUserId) {
          try {
            const uSnap = await getDoc(doc(db, "users", otherUserId));
            if (uSnap.exists()) {
              otherUsername = uSnap.data()?.name || "Unknown";
              otherPhotoURL = uSnap.data()?.photoURL || "";
            }
          } catch {}
        }
        list.push({ id: chatDoc.id, ...data, otherUserId, otherUsername, otherPhotoURL });
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
          <Text style={styles.newBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptyText}>Start a chat with someone.</Text>
            <TouchableOpacity style={styles.startBtn} onPress={() => navigation.navigate("Users")}>
              <Text style={styles.startBtnText}>New Message</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Chat", {
              chatId: item.id, userId: item.otherUserId, username: item.otherUsername,
            })}
            style={styles.item}
          >
            {item.otherPhotoURL ? (
              <Image source={{ uri: item.otherPhotoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {item.otherUsername?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>{item.otherUsername}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>
                {item.lastMessage || "Say hello!"}
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: theme.colors.text },
  newBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  newBtnText: { color: theme.colors.primary, fontSize: 22, lineHeight: 26, fontWeight: "700" },
  item: {
    flexDirection: "row", alignItems: "center", padding: 14,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border, gap: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: theme.colors.border },
  avatarFallback: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: theme.colors.primary, fontWeight: "800", fontSize: 20 },
  username: { color: theme.colors.text, fontWeight: "700", fontSize: 15 },
  lastMsg: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  arrow: { color: theme.colors.textMuted, fontSize: 22 },
  emptyWrap: { alignItems: "center", marginTop: 80, gap: 10, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center" },
  startBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: theme.radius.full, marginTop: 8,
  },
  startBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});