// screens/profile/NotificationsScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, StatusBar } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

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
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, notifications.length === 0 && { flex: 1 }]}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{item.type || "new"}</Text>
            </View>
            <Text style={styles.itemText}>{item.text || "New notification"}</Text>
          </View>
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
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  headerTitle: {
    fontSize: theme.font.xl,
    fontWeight: "900",
    color: theme.colors.text,
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
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
  },
  typeText: {
    color: theme.colors.primary,
    fontSize: theme.font.xs,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  itemText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.sm,
    lineHeight: 20,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.font.md,
    color: theme.colors.textMuted,
    fontWeight: "600",
  },
});
