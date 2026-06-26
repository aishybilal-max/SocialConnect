import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

const ICON_MAP: Record<string, string> = {
  like:    "❤️",
  comment: "💬",
  follow:  "🌿",
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;
    const q = query(
      collection(db, "users", auth.currentUser.uid, "notifications"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛎  Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🌿</Text>
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.iconCircle}>
              <Text style={styles.itemIcon}>{ICON_MAP[item.type] ?? "🔔"}</Text>
            </View>
            <Text style={styles.itemText}>{item.text || "New notification"}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.text },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  itemIcon: { fontSize: 20 },
  itemText: { flex: 1, color: theme.colors.text, fontSize: 14 },

  emptyWrap:    { alignItems: "center", marginTop: 80 },
  emptyIcon:    { fontSize: 48, marginBottom: 12 },
  emptyText:    { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  emptySubText: { fontSize: 14, color: theme.colors.textSub, marginTop: 4 },
});