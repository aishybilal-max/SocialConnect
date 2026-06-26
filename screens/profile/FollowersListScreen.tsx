// screens/profile/FollowersListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator,
} from "react-native";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

export default function FollowersListScreen({ route, navigation }: any) {
  const { userId, type } = route.params; // type: "followers" | "following"
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // followers ya following subcollection se IDs uthao
        const snap = await getDocs(collection(db, "users", userId, type));
        const ids = snap.docs.map((d) => d.id);

        // Har ID ka user data fetch karo
        const userList: any[] = [];
        for (const id of ids) {
          const uSnap = await getDoc(doc(db, "users", id));
          if (uSnap.exists()) {
            userList.push({ id: uSnap.id, ...uSnap.data() });
          }
        }
        setUsers(userList);
      } catch (e) {
        console.log("FollowersList error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, type]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === "followers" ? "Followers" : "Following"}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No {type} yet</Text>
              <Text style={styles.emptyText}>
                {type === "followers"
                  ? "Nobody is following this account yet."
                  : "This account is not following anyone yet."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userRow}
              onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
            >
              {/* Avatar */}
              {item.photoURL ? (
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {(item.name || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Info */}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.name || item.username || "Unknown"}</Text>
                {!!item.bio && (
                  <Text style={styles.userBio} numberOfLines={1}>{item.bio}</Text>
                )}
              </View>

              {/* Arrow */}
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },

  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: theme.colors.primary, fontSize: 32, lineHeight: 36 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },

  userRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    gap: 12,
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  avatarFallback: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 18, fontWeight: "700", color: theme.colors.primary },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  userBio: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 22, color: theme.colors.textMuted },

  emptyWrap: { alignItems: "center", marginTop: 80, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center", lineHeight: 20 },
});