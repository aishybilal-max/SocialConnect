// screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, Image, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from "react-native";
import {
  doc, getDoc, collection, query,
  where, onSnapshot, setDoc, serverTimestamp,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { clearUser } from "../../store/slices/authSlice";
import { auth, db } from "../../config/firebase";
import FollowButton from "../../components/FollowButton";
import { getChatId } from "../../utils/chat";
import { theme } from "../../theme";

export default function ProfileScreen({ route, navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const routeUserId = route?.params?.userId;
  const userId = routeUserId || reduxUser?.uid;
  const isMyProfile = userId === reduxUser?.uid;

  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // ✅ Agar apni profile hai toh Redux se lo, warna Firestore se
    if (isMyProfile && reduxUser) {
      setUserData(reduxUser);
      setLoading(false);
    } else {
      getDoc(doc(db, "users", userId)).then((snap) => {
        setUserData(snap.exists() ? snap.data() : null);
        setLoading(false);
      });
    }

    const unsub = onSnapshot(
      query(collection(db, "posts"), where("userId", "==", userId)),
      (snap) => setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [userId]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());         // ✅ Redux clear
    navigation.replace("Login");
  };

  const startChat = async () => {
    const myId = reduxUser?.uid;
    if (!myId || !userId) return;
    const chatId = getChatId(myId, userId);
    await setDoc(
      doc(db, "chats", chatId),
      { participants: [myId, userId], updatedAt: serverTimestamp() },
      { merge: true }
    );
    navigation.navigate("Chat", {
      chatId, userId,
      username: userData?.name || userData?.username,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textSub }}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              {!isMyProfile && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.topBarName}>
                {userData?.name || userData?.username || "Profile"}
              </Text>
              {isMyProfile && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.settingsBtn}
                >
                  <Text style={styles.settingsIcon}>⚙️</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.profileHeader}>
              <View style={styles.avatarWrap}>
                {userData?.photoURL ? (
                  <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>
                      {(userData?.name || "U").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statNum}>{posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
              </View>
            </View>

            <View style={styles.bioArea}>
              <Text style={styles.bioName}>{userData?.name || userData?.username}</Text>
              {!!userData?.bio && <Text style={styles.bioText}>{userData.bio}</Text>}
            </View>

            <View style={styles.actionRow}>
              {isMyProfile ? (
                <>
                  <TouchableOpacity
                    style={styles.outlineBtn}
                    onPress={() => navigation.navigate("EditProfile")}
                  >
                    <Text style={styles.outlineBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.outlineBtn, styles.dangerBtn]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.dangerBtnText}>Logout</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <FollowButton userId={userId} />
                  <TouchableOpacity style={styles.outlineBtn} onPress={startChat}>
                    <Text style={styles.outlineBtnText}>➤  Message</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={styles.gridDivider}>
              <Text style={styles.gridDividerText}>★  POSTS</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No posts yet</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.gridCell}>
            {item.mediaUrl ? (
              <Image source={{ uri: item.mediaUrl }} style={styles.gridImg} />
            ) : (
              <View style={[styles.gridImg, styles.gridImgPlaceholder]}>
                <Text style={{ color: theme.colors.textMuted, fontSize: 20 }}>📝</Text>
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.colors.bg },
  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { marginRight: 12, padding: 4 },
  backText: { color: theme.colors.primary, fontSize: 32, lineHeight: 32 },
  topBarName: { flex: 1, fontSize: 17, fontWeight: "800", color: theme.colors.text },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },
  profileHeader: {
    flexDirection: "row", alignItems: "center",
    padding: 16, backgroundColor: theme.colors.surface, gap: 24,
  },
  avatarWrap: {},
  avatar: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: theme.colors.primary },
  avatarFallback: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 2, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 36, color: theme.colors.primary, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 28 },
  stat: { alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  statLabel: { fontSize: 12, color: theme.colors.textSub, marginTop: 2 },
  bioArea: { backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingBottom: 12 },
  bioName: { fontSize: 15, fontWeight: "700", color: theme.colors.text },
  bioText: { fontSize: 13, color: theme.colors.textSub, marginTop: 4 },
  actionRow: {
    flexDirection: "row", gap: 10,
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  outlineBtn: {
    flex: 1, borderWidth: 1.5, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, paddingVertical: 9, alignItems: "center",
  },
  outlineBtnText: { color: theme.colors.text, fontWeight: "600", fontSize: 13 },
  dangerBtn: { borderColor: theme.colors.danger },
  dangerBtnText: { color: theme.colors.danger, fontWeight: "600", fontSize: 13 },
  gridDivider: {
    borderTopWidth: 1, borderTopColor: theme.colors.border,
    paddingVertical: 10, alignItems: "center",
  },
  gridDividerText: { color: theme.colors.textMuted, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  gridCell: { flex: 1 / 3, aspectRatio: 1, padding: 1 },
  gridImg: { width: "100%", height: "100%" },
  gridImgPlaceholder: {
    backgroundColor: theme.colors.surfaceHigh,
    justifyContent: "center", alignItems: "center",
  },
  emptyText: { textAlign: "center", marginTop: 40, color: theme.colors.textMuted, fontSize: 15 },
});