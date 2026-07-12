// screens/profile/NotificationsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet, StatusBar,
  TouchableOpacity,
} from "react-native";
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  like:    { icon: "♥", color: theme.colors.danger },
  comment: { icon: "✦", color: theme.colors.primary },
  follow:  { icon: "✓", color: theme.colors.success },
  message: { icon: "→", color: theme.colors.accent },
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

  const markRead = async (id: string) => {
    if (!auth.currentUser?.uid) return;
    try {
      await updateDoc(
        doc(db, "users", auth.currentUser.uid, "notifications", id),
        { read: true }
      );
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = TYPE_CONFIG[item.type] || { icon: "•", color: theme.colors.textSub };
          const isUnread = !item.read;
          return (
            <TouchableOpacity
              style={[styles.item, isUnread && styles.itemUnread]}
              onPress={() => markRead(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: cfg.color + "22" }]}>
                <Text style={[styles.icon, { color: cfg.color }]}>{cfg.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>{item.text || "New notification"}</Text>
                <Text style={styles.itemType}>{item.type}</Text>
              </View>
              {isUnread && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
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
    flexDirection: "row", alignItems: "center", gap: 14,
    padding: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  itemUnread: { backgroundColor: theme.colors.surfaceHigh },
  iconCircle: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
  },
  icon: { fontSize: 18, fontWeight: "700" },
  itemText: { color: theme.colors.text, fontSize: 14, lineHeight: 20 },
  itemType: {
    color: theme.colors.textMuted, fontSize: 11,
    fontWeight: "600", marginTop: 2, textTransform: "capitalize",
  },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  emptyWrap: { alignItems: "center", marginTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textMuted },
});