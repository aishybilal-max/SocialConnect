// screens/reels/ReelsScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, Dimensions,
  TouchableOpacity, StatusBar, Alert, ActivityIndicator,
  TextInput, Modal, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import {
  collection, onSnapshot, query, orderBy,
  doc, updateDoc, arrayUnion, arrayRemove,
  addDoc, deleteDoc, serverTimestamp, getDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { db } from "../../config/firebase";
import { theme } from "../../theme";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

const { width, height } = Dimensions.get("window");

// ─── Single Reel Item ────────────────────────────────────────────────────────
function ReelItem({
  item, isActive, myId, myUser, pfp, navigation,
  onLike, onDelete, onOpenComments,
}: any) {
  const videoRef = useRef<Video>(null);
  const [paused, setPaused] = useState(false);

  // Auto play/pause when scroll changes
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive && !paused) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isActive, paused]);

  const togglePause = () => {
    setPaused((p) => !p);
  };

  const likes = Array.isArray(item.likes) ? item.likes : [];
  const liked = likes.includes(myId ?? "");
  const isMyReel = item.userId === myId;

  return (
    <View style={[styles.reelCard, { height }]}>
      {/* VIDEO — tap anywhere to pause/play */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePause}
        style={StyleSheet.absoluteFill}
      >
        {item.mediaUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: item.mediaUrl }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive && !paused}
            isLooping
            isMuted={false}
          />
        ) : (
          <View style={[styles.media, styles.mediaFallback]}>
            <Text style={{ color: theme.colors.textMuted }}>No Media</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Pause indicator — center */}
      {paused && (
        <View style={styles.pauseOverlay} pointerEvents="none">
          <View style={styles.pauseIcon}>
            <Text style={styles.pauseIconText}>II</Text>
          </View>
        </View>
      )}

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        <TouchableOpacity
          onPress={() => navigation.navigate("UserProfile", { userId: item.userId })}
          style={styles.userRow}
        >
          {pfp ? (
            <Image source={{ uri: pfp }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>
                {(item.username || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>
        {!!item.caption && (
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
        )}
      </View>

      {/* Right actions */}
      <View style={styles.rightActions} pointerEvents="box-none">
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={() => onLike(item)}>
          <View style={[styles.actionIcon, liked && styles.actionIconActive]}>
            <Text style={styles.actionIconText}>♥</Text>
          </View>
          <Text style={styles.actionCount}>{likes.length}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionItem} onPress={() => onOpenComments(item)}>
          <View style={styles.actionIcon}>
            <Text style={styles.actionIconText}>✦</Text>
          </View>
          <Text style={styles.actionCount}>Comment</Text>
        </TouchableOpacity>

        {/* Delete — only own reel */}
        {isMyReel && (
          <TouchableOpacity style={styles.actionItem} onPress={() => onDelete(item)}>
            <View style={[styles.actionIcon, styles.actionIconDanger]}>
              <Text style={styles.actionIconText}>✕</Text>
            </View>
            <Text style={styles.actionCount}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function ReelsScreen({ navigation }: any) {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  const [commentModal, setCommentModal] = useState(false);
  const [selectedReel, setSelectedReel] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const commentUnsubRef = useRef<any>(null);

  const myUser = useSelector((state: RootState) => state.auth.user);
  const myId = myUser?.uid;

  useEffect(() => {
    const q = query(collection(db, "reels"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setReels(fetched);
      setLoading(false);

      const photos: Record<string, string> = {};
      for (const reel of fetched) {
        if (reel.userId && !photos[reel.userId]) {
          try {
            const uSnap = await getDoc(doc(db, "users", reel.userId));
            if (uSnap.exists()) {
              photos[reel.userId] = uSnap.data()?.photoURL || "";
            }
          } catch {}
        }
      }
      setUserPhotos(photos);
    });
    return () => unsub();
  }, []);

  const toggleLike = useCallback(async (reel: any) => {
    if (!myId) return;
    const likes = Array.isArray(reel.likes) ? reel.likes : [];
    const liked = likes.includes(myId);
    try {
      await updateDoc(doc(db, "reels", reel.id), {
        likes: liked ? arrayRemove(myId) : arrayUnion(myId),
      });
    } catch {}
  }, [myId]);

  const deleteReel = useCallback((reel: any) => {
    if (reel.userId !== myId) return;
    Alert.alert("Delete Reel", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => { await deleteDoc(doc(db, "reels", reel.id)); },
      },
    ]);
  }, [myId]);

  const openComments = useCallback((reel: any) => {
    setSelectedReel(reel);
    setComments([]);
    setCommentText("");
    setCommentModal(true);
    const q = query(
      collection(db, "reels", reel.id, "comments"),
      orderBy("createdAt", "asc")
    );
    commentUnsubRef.current = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const closeComments = () => {
    setCommentModal(false);
    setSelectedReel(null);
    setComments([]);
    if (commentUnsubRef.current) {
      commentUnsubRef.current();
      commentUnsubRef.current = null;
    }
  };

  const addComment = async () => {
    if (!commentText.trim() || !selectedReel || !myId) return;
    setCommentLoading(true);
    try {
      await addDoc(collection(db, "reels", selectedReel.id, "comments"), {
        text: commentText.trim(),
        userId: myId,
        username: myUser?.name || "Unknown",
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch {
      Alert.alert("Error", "Comment failed");
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = (commentId: string, commentUserId: string) => {
    if (myId !== commentUserId) return;
    Alert.alert("Delete", "Remove this comment?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await deleteDoc(doc(db, "reels", selectedReel.id, "comments", commentId));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptyText}>Be the first to share a video.</Text>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => navigation.navigate("CreateReel")}
        >
          <Text style={styles.uploadBtnText}>Upload Reel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      <TouchableOpacity
        style={styles.topUploadBtn}
        onPress={() => navigation.navigate("CreateReel")}
      >
        <Text style={styles.topUploadText}>+ Reel</Text>
      </TouchableOpacity>

      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / height);
          setActiveIndex(index);
        }}
        renderItem={({ item, index }) => (
          <ReelItem
            item={item}
            isActive={index === activeIndex}
            myId={myId}
            myUser={myUser}
            pfp={userPhotos[item.userId] || ""}
            navigation={navigation}
            onLike={toggleLike}
            onDelete={deleteReel}
            onOpenComments={openComments}
          />
        )}
      />

      {/* Comments Modal */}
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
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 14 }}>
                  No comments yet.
                </Text>
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
                    <Text style={{ color: theme.colors.danger, fontSize: 12, fontWeight: "600" }}>
                      Delete
                    </Text>
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
  container: { flex: 1, backgroundColor: "#000" },
  center: {
    flex: 1, backgroundColor: "#000",
    justifyContent: "center", alignItems: "center", gap: 12, padding: 32,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  emptyText: { fontSize: 14, color: theme.colors.textSub, textAlign: "center" },
  uploadBtn: {
    marginTop: 8, backgroundColor: theme.colors.primary,
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: theme.radius.md,
  },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  topUploadBtn: {
    position: "absolute", top: 52, right: 16, zIndex: 99,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderWidth: 1, borderColor: theme.colors.primary,
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: theme.radius.full,
  },
  topUploadText: { color: theme.colors.primary, fontWeight: "700", fontSize: 13 },

  reelCard: { width, backgroundColor: "#000" },
  media: { width, height: "100%" },
  mediaFallback: { backgroundColor: "#111", justifyContent: "center", alignItems: "center" },

  // Pause overlay
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center", alignItems: "center",
  },
  pauseIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center", alignItems: "center",
  },
  pauseIconText: { color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: 4 },

  bottomOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 80,
    padding: 20, paddingBottom: 40,
  },
  userRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: theme.colors.primary },
  avatarFallback: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarText: { color: theme.colors.primary, fontWeight: "700", fontSize: 16 },
  username: { color: "#fff", fontWeight: "700", fontSize: 14 },
  caption: { color: "#ddd", fontSize: 13, lineHeight: 18 },

  rightActions: {
    position: "absolute", right: 12, bottom: 100,
    alignItems: "center", gap: 20,
  },
  actionItem: { alignItems: "center", gap: 4 },
  actionIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  actionIconActive: { backgroundColor: "rgba(109,190,140,0.35)" },
  actionIconDanger: { backgroundColor: "rgba(217,95,95,0.3)" },
  actionIconText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  actionCount: { color: "#ccc", fontSize: 11, fontWeight: "600" },

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