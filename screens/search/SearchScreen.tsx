// screens/search/SearchScreen.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator,
} from "react-native";
import {
  collection, getDocs, query,
  where, orderBy, startAt, endAt,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

type ResultType = "user" | "post";
interface Result {
  id: string;
  type: ResultType;
  name?: string;
  email?: string;
  photoURL?: string;
  caption?: string;
  mediaUrl?: string;
  username?: string;
  userId?: string;
}

export default function SearchScreen({ navigation }: any) {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;
    setLoading(true);
    setSearched(true);
    const term = searchText.trim().toLowerCase();

    try {
      const allResults: Result[] = [];

      // ── Search Users ──────────────────────────────────────
      const usersSnap = await getDocs(collection(db, "users"));
      usersSnap.forEach((d) => {
        const data = d.data();
        const name = (data.name || "").toLowerCase();
        const email = (data.email || "").toLowerCase();
        if (name.includes(term) || email.includes(term)) {
          allResults.push({
            id: d.id,
            type: "user",
            name: data.name || data.username || "Unknown",
            email: data.email || "",
            photoURL: data.photoURL || "",
          });
        }
      });

      // ── Search Posts ──────────────────────────────────────
      const postsSnap = await getDocs(collection(db, "posts"));
      postsSnap.forEach((d) => {
        const data = d.data();
        const caption = (data.caption || "").toLowerCase();
        const username = (data.username || "").toLowerCase();
        if (caption.includes(term) || username.includes(term)) {
          allResults.push({
            id: d.id,
            type: "post",
            caption: data.caption || "",
            mediaUrl: data.mediaUrl || null,
            username: data.username || "",
            userId: data.userId || "",
          });
        }
      });

      setResults(allResults);
    } catch (e) {
      console.log("Search error:", e);
    } finally {
      setLoading(false);
    }
  };

  const users = results.filter((r) => r.type === "user");
  const posts = results.filter((r) => r.type === "post");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Search users or posts..."
          placeholderTextColor={theme.colors.textMuted}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          style={styles.searchInput}
          autoCapitalize="none"
        />
        <TouchableOpacity
          onPress={handleSearch}
          disabled={loading || !searchText.trim()}
          style={[styles.searchBtn, (!searchText.trim() || loading) && { opacity: 0.5 }]}
        >
          <Text style={styles.searchBtnText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => ""}
          renderItem={null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* Users Section */}
              {users.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>People</Text>
                  {users.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.userRow}
                      onPress={() => navigation.navigate("UserProfile", { userId: item.id })}
                    >
                      {item.photoURL ? (
                        <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                      ) : (
                        <View style={styles.avatarFallback}>
                          <Text style={styles.avatarText}>
                            {(item.name || "?").charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{item.name}</Text>
                        <Text style={styles.userEmail}>{item.email}</Text>
                      </View>
                      <Text style={styles.arrow}>›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Posts Section */}
              {posts.length > 0 && (
                <View>
                  <Text style={styles.sectionTitle}>Posts</Text>
                  {posts.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.postRow}
                      onPress={() => navigation.navigate("UserProfile", { userId: item.userId })}
                    >
                      {item.mediaUrl ? (
                        <Image source={{ uri: item.mediaUrl }} style={styles.postThumb} />
                      ) : (
                        <View style={[styles.postThumb, styles.postThumbFallback]}>
                          <Text style={{ color: theme.colors.textMuted, fontSize: 18 }}>T</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.postUsername}>{item.username}</Text>
                        <Text style={styles.postCaption} numberOfLines={2}>
                          {item.caption || "No caption"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Empty state */}
              {searched && results.length === 0 && !loading && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyTitle}>No results found</Text>
                  <Text style={styles.emptyText}>
                    Try searching with a different keyword.
                  </Text>
                </View>
              )}

              {!searched && (
                <View style={styles.emptyWrap}>
                  <Text style={styles.emptyText}>
                    Search for people or posts above.
                  </Text>
                </View>
              )}
            </View>
          }
        />
      )}
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

  searchRow: {
    flexDirection: "row", gap: 10,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14, paddingVertical: 10,
    color: theme.colors.text, fontSize: 14,
  },
  searchBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, borderRadius: theme.radius.md,
    justifyContent: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  sectionTitle: {
    fontSize: 12, fontWeight: "700", color: theme.colors.textMuted,
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
  },

  userRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: theme.colors.border },
  avatarFallback: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: theme.colors.primary, fontWeight: "700", fontSize: 18 },
  userName: { fontSize: 15, fontWeight: "600", color: theme.colors.text },
  userEmail: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 22, color: theme.colors.textMuted },

  postRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  postThumb: { width: 56, height: 56, borderRadius: 8 },
  postThumbFallback: {
    backgroundColor: theme.colors.surfaceHigh,
    justifyContent: "center", alignItems: "center",
  },
  postUsername: { fontSize: 13, fontWeight: "700", color: theme.colors.primary, marginBottom: 3 },
  postCaption: { fontSize: 13, color: theme.colors.textSub, lineHeight: 18 },

  emptyWrap: { alignItems: "center", marginTop: 60, paddingHorizontal: 32, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  emptyText: { fontSize: 14, color: theme.colors.textMuted, textAlign: "center" },
});