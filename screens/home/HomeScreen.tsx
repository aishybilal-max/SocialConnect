// screens/home/HomeScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View, FlatList, StyleSheet, StatusBar, Text,
  Image, TouchableOpacity, ActivityIndicator,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform,
} from "react-native";
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, arrayUnion, arrayRemove,
  deleteDoc, addDoc, serverTimestamp, getDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { db } from "../../config/firebase";
import { theme } from "../../theme";
import StoriesBar from "../../components/StoriesBar";
import CreatePostScreen from "./CreatePostScreen";
import { sendNotification } from "../../utils/notifications";

export default function HomeScreen({ navigation }: any) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});
  const myUser = useSelector((state: RootState) => state.auth.user);
  const myId = myUser?.uid;

  const [commentModal, setCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const commentUnsubRef = useRef<any>(null);

  useEffect(() => {
    setIsLoading(true);
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const fetched = snap.docs.map((d) => ({
        id: d.id,
        caption: d.data().caption ?? "",
        mediaUrl: d.data().mediaUrl ?? null,
        userId: d.data().userId ?? "",
        username: d.data().username ?? "",
        likes: Array.isArray(d.data().likes) ? d.data().likes : [],
        createdAt: d.data().createdAt ?? null,
      }));
      setPosts(fetched);
      setIsLoading(false);

      // ✅ Har post ke user ki pfp fetch karo
      const photos: Record<string, string> = {};
      for (const post of fetched) {
        if (post.userId && !photos[post.userId]) {
          try {
            const uSnap = await getDoc(doc(db, "users", post.userId));
            if (uSnap.exists()) {
              photos[post.userId] = uSnap.data()?.photoURL || "";
            }
          } catch {}
        }
      }
      setUserPhotos(photos);
    });
    return () => unsub();
  }, []);

  const toggleLike = async (post: any) => {
    if (!myId) return;
    const likes = Array.isArray(post.likes) ? post.likes : [];
    const liked = likes.includes(myId);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likes: liked ? arrayRemove(myId) : arrayUnion(myId),
      });
      // ✅ Notification sirf doosre ki post like karne par
      if (!liked && post.userId !== myId) {
        await sendNotification(
          post.userId, myId,
          "like",
          `${myUser?.name || "Someone"} liked your post`
        );
      }
    } catch {}
  };

  const deletePost = (post: any) => {
    if (post.userId !== myId) return;
    Alert.alert("Delete Post", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try { await deleteDoc(doc(db, "posts", post.id)); }
          catch { Alert.alert("Error", "Could not delete post"); }
        },
      },
    ]);
  };

  const openComments = (post: any) => {
    setSelectedPost(post);
    setComments([]);
    setCommentText("");
    setCommentModal(true);
    const q = query(
      collection(db, "posts", post.id, "comments"),
      orderBy("createdAt", "asc")
    );
    commentUnsubRef.current = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  };

  const closeComments = () => {
    setCommentModal(false);
    setSelectedPost(null);
    setComments([]);
    if (commentUnsubRef.current) {
      commentUnsubRef.current();
      commentUnsubRef.current = null;
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !selectedPost || !myId) return;
    setCommentLoading(true);
    try {
      await addDoc(collection(db, "posts", selectedPost.id, "comments"), {
        text: commentText.trim(),
        userId: myId,
        username: myUser?.name || "Unknown",
        createdAt: serverTimestamp(),
      });
      // ✅ Notification sirf doosre ki post par comment karne par
      if (selectedPost.userId !== myId) {
        await sendNotification(
          selectedPost.userId, myId,
          "comment",
          `${myUser?.name || "Someone"} commented on your post`
        );
      }
      setCommentText("");
    } catch {
      Alert.alert("Error", "Comment failed");
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = (commentId: string, commentUserId: string) => {
    if (myId !== commentUserId) return;
    Alert.alert("Delete Comment", "Remove this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "posts", selectedPost.id, "comments", commentId));
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SocialConnect</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.headerRight}>Settings</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View>
              <View style={styles.storiesWrap}>
                <StoriesBar navigation={navigation} />
              </View>
              <CreatePostScreen />
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Be the first to share something.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const likes = Array.isArray(item.likes) ? item.likes : [];
            const liked = likes.includes(myId ?? "");
            const isMyPost = item.userId === myId;
            const pfp = userPhotos[item.userId] || "";

            return (
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate("UserProfile", { userId: item.userId })}
                    style={styles.postHeaderLeft}
                  >
                    {/* ✅ PFP */}
                    {pfp ? (
                      <Image source={{ uri: pfp }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarText}>
                          {(item.username || "?").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <Text style={styles.postUsername}>{item.username}</Text>
                  </TouchableOpacity>
                  {isMyPost && (
                    <View style={styles.postActions}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("EditPost", { post: item })}
                        style={styles.editBtn}
                      >
                        <Text style={styles.editBtnText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletePost(item)} style={styles.deleteBtn}>
                        <Text style={styles.deleteBtnText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {item.mediaUrl ? (
                  <Image source={{ uri: item.mediaUrl }} style={styles.postImage} resizeMode="cover" />
                ) : null}

                {!!item.caption && (
                  <Text style={styles.postCaption}>{item.caption}</Text>
                )}

                <View style={styles.actionRow}>
                  <TouchableOpacity onPress={() => toggleLike(item)} style={styles.actionBtn}>
                    <View style={[styles.likeIcon, liked && styles.likeIconActive]}>
                      <Text style={[styles.likeIconText, liked && styles.likeIconTextActive]}>
                        {liked ? "Liked" : "Like"}
                      </Text>
                    </View>
                    <Text style={styles.actionCount}>{likes.length}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => openComments(item)} style={styles.actionBtn}>
                    <View style={styles.commentIconWrap}>
                      <Text style={styles.commentIconText}>Comment</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={commentModal} animationType="slide" onRequestClose={closeComments}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={closeComments} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>No comments yet. Start the conversation.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {(item.username || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentUsername}>{item.username}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                </View>
                {item.userId === myId && (
                  <TouchableOpacity onPress={() => deleteComment(item.id, item.userId)}>
                    <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: "600" }}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          />

          <View style={styles.commentInputRow}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.commentInput}
              multiline
            />
            <TouchableOpacity
              onPress={addComment}
              disabled={commentLoading || !commentText.trim()}
              style={[styles.sendBtn, (!commentText.trim() || commentLoading) && { opacity: 0.4 }]}
            >
              {commentLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.sendBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  headerTitle: { fontSize: 18, fontWeight: "800", color: theme.colors.text, letterSpacing: 0.3 },
  headerRight: { fontSize: 13, color: theme.colors.textSub },
  storiesWrap: {
    paddingVertical: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    marginBottom: 8,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  postHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingVertical: 12,
  },
  postHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border },
  avatarFallback: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1, borderColor: theme.colors.primary,
  },
  avatarText: { color: theme.colors.primary, fontWeight: "700", fontSize: 15 },
  postUsername: { color: theme.colors.text, fontWeight: "600", fontSize: 14 },
  postActions: { flexDirection: "row", gap: 6 },
  editBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, backgroundColor: theme.colors.primarySoft,
  },
  editBtnText: { color: theme.colors.primary, fontSize: 12, fontWeight: "600" },
  deleteBtn: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, backgroundColor: theme.colors.surfaceHigh,
  },
  deleteBtnText: { color: theme.colors.danger, fontSize: 12, fontWeight: "600" },
  postImage: { width: "100%", height: 300 },
  postCaption: {
    color: theme.colors.text, fontSize: 14, lineHeight: 20,
    paddingHorizontal: 14, paddingTop: 10,
  },
  actionRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  likeIcon: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceHigh,
  },
  likeIconActive: { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.primary },
  likeIconText: { color: theme.colors.textSub, fontSize: 12, fontWeight: "600" },
  likeIconTextActive: { color: theme.colors.primary },
  actionCount: { color: theme.colors.textMuted, fontSize: 12 },
  commentIconWrap: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6, borderWidth: 1, borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceHigh,
  },
  commentIconText: { color: theme.colors.textSub, fontSize: 12, fontWeight: "600" },
  emptyWrap: { alignItems: "center", marginTop: 60, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  emptyText: { color: theme.colors.textMuted, fontSize: 14, textAlign: "center" },
  modalContainer: { flex: 1, backgroundColor: theme.colors.bg },
  modalHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  closeBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 6, backgroundColor: theme.colors.surfaceHigh,
  },
  closeBtnText: { color: theme.colors.textSub, fontSize: 13, fontWeight: "600" },
  commentItem: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: theme.colors.surface, padding: 12,
    borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border,
  },
  commentAvatar: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
  },
  commentAvatarText: { color: theme.colors.primary, fontWeight: "700", fontSize: 12 },
  commentUsername: { color: theme.colors.primary, fontWeight: "700", fontSize: 12, marginBottom: 2 },
  commentText: { color: theme.colors.text, fontSize: 13, lineHeight: 18 },
  commentInputRow: {
    flexDirection: "row", alignItems: "center", gap: 10, padding: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  commentInput: {
    flex: 1, backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 14, paddingVertical: 8,
    color: theme.colors.text, fontSize: 14, maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: theme.radius.full,
  },
  sendBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});