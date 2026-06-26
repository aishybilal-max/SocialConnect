import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar,
} from "react-native";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { getChatId } from "../../utils/chat";
import { theme } from "../../theme";

export default function UserListScreen({ navigation }: any) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snap.forEach((d) => {
        if (d.id !== auth.currentUser?.uid) list.push({ id: d.id, ...d.data() });
      });
      setUsers(list);
    })();
  }, []);

  const startChat = async (otherUser: any) => {
    const myId = auth.currentUser?.uid;
    if (!myId) return;
    const chatId = getChatId(myId, otherUser.id);
    await setDoc(
      doc(db, "chats", chatId),
      { participants: [myId, otherUser.id], updatedAt: serverTimestamp(), lastMessage: "" },
      { merge: true }
    );
    navigation.navigate("Chat", {
      chatId,
      userId: otherUser.id,
      username: otherUser.name || otherUser.username,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <View style={{ width: 36 }} />
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => startChat(item)} style={styles.item}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(item.name || item.username || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.username}>{item.name || item.username}</Text>
              <Text style={styles.email}>{item.email}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn:     { width: 36, height: 36, justifyContent: "center" },
  backText:    { color: theme.colors.primary, fontSize: 32, lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.text },

  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    gap: 12,
  },
  avatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: theme.colors.primary, fontWeight: "800", fontSize: 18 },
  username:   { color: theme.colors.text, fontWeight: "600", fontSize: 15 },
  email:      { color: theme.colors.textMuted, fontSize: 12, marginTop: 2 },
  arrow:      { color: theme.colors.textMuted, fontSize: 22 },
});

