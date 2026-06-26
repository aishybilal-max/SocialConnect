// screens/home/HomeScreen.tsx
import React, { useEffect } from "react";
import {
  View, FlatList, StyleSheet, StatusBar, Text,
  Image, TouchableOpacity, ActivityIndicator,
} from "react-native";
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, arrayUnion, arrayRemove,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { setPosts, updatePostLikes, setLoading, Post } from "../../store/slices/postsSlice";
import { db } from "../../config/firebase";
import { theme } from "../../theme";
import StoriesBar from "../../components/StoriesBar";
import CreatePostScreen from "./CreatePostScreen";

export default function HomeScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const { posts, loading } = useSelector((state: RootState) => state.posts);
  const myUser = useSelector((state: RootState) => state.auth.user);
  const myId = myUser?.uid;

  // ✅ Firestore listener → Redux store update
  useEffect(() => {
    dispatch(setLoading(true));
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const fetched: Post[] = snap.docs.map((d) => ({
        id: d.id,
        caption: d.data().caption ?? "",
        mediaUrl: d.data().mediaUrl ?? null,
        mediaType: d.data().mediaType ?? null,
        userId: d.data().userId ?? "",
        username: d.data().username ?? "",
        likes: d.data().likes ?? [],
        createdAt: d.data().createdAt ?? null,
      }));
      dispatch(setPosts(fetched));
      dispatch(setLoading(false));
    });
    return () => unsub();
  }, []);

  const toggleLike = async (post: Post) => {
    if (!myId) return;
    const liked = post.likes.includes(myId);
    const newLikes = liked
      ? post.likes.filter((id) => id !== myId)
      : [...post.likes, myId];

    // Optimistic update in Redux
    dispatch(updatePostLikes({ postId: post.id, likes: newLikes }));

    // Firestore update
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likes: liked ? arrayRemove(myId) : arrayUnion(myId),
      });
    } catch (e) {
      // Revert on error
      dispatch(updatePostLikes({ postId: post.id, likes: post.likes }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌿 SocialConnect</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {loading && posts.length === 0 ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              {/* STORIES BAR */}
              <View style={styles.storiesWrap}>
                <StoriesBar navigation={navigation} />
              </View>
              {/* CREATE POST */}
              <CreatePostScreen />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>🌸</Text>
              <Text style={styles.emptyText}>No posts yet. Be the first!</Text>
            </View>
          }
          renderItem={({ item }) => {
           // ✅ Yeh karo
           const liked = Array.isArray(item.likes) && item.likes.includes(myId ?? "");
            return (
              <View style={styles.postCard}>
                {/* POST HEADER */}
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("UserProfile", { userId: item.userId })
                  }
                  style={styles.postHeader}
                >
                  <View style={styles.postAvatar}>
                    <Text style={styles.postAvatarText}>
                      {(item.username || "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.postUsername}>{item.username}</Text>
                </TouchableOpacity>

                {/* POST IMAGE */}
                {item.mediaUrl ? (
                  <Image
                    source={{ uri: item.mediaUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ) : null}

                {/* CAPTION */}
                {!!item.caption && (
                  <Text style={styles.postCaption}>{item.caption}</Text>
                )}

                {/* LIKE ROW */}
                <View style={styles.likeRow}>
                  <TouchableOpacity
                    onPress={() => toggleLike(item)}
                    style={styles.likeBtn}
                  >
                    <Text style={styles.likeIcon}>{liked ? "❤️" : "🤍"}</Text>
                    <Text style={styles.likeCount}>{item.likes.length} likes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: "800", color: theme.colors.text },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },

  storiesWrap: {
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },

  postCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  postHeader: {
    flexDirection: "row", alignItems: "center",
    padding: 12, gap: 10,
  },
  postAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  postAvatarText: { color: theme.colors.primary, fontWeight: "800", fontSize: 16 },
  postUsername: { color: theme.colors.text, fontWeight: "700", fontSize: 14 },

  postImage: { width: "100%", height: 300 },
  postCaption: {
    color: theme.colors.text, fontSize: 14, lineHeight: 20,
    paddingHorizontal: 12, paddingTop: 10,
  },
  likeRow: {
    flexDirection: "row",
    paddingHorizontal: 12, paddingVertical: 10,
  },
  likeBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeIcon: { fontSize: 20 },
  likeCount: { color: theme.colors.textSub, fontSize: 13 },

  emptyWrap: { alignItems: "center", marginTop: 80, gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: theme.colors.textMuted, fontSize: 15 },
});