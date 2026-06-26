// screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  doc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  serverTimestamp,
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
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const unsubUser = onSnapshot(
      doc(db, "users", userId),
      (snap) => {
        const data = snap.exists() ? { uid: snap.id, ...snap.data() } : null;

        if (data) {
          setUserData(data);
          setFollowers(Array.isArray(data.followers) ? data.followers : []);
          setFollowing(Array.isArray(data.following) ? data.following : []);
        } else if (isMyProfile && reduxUser) {
          setUserData(reduxUser);
          setFollowers([]);
          setFollowing([]);
        } else {
          setUserData(null);
        }

        setLoading(false);
      },
      () => setLoading(false)
    );

    const unsubPosts = onSnapshot(
      query(collection(db, "posts"), where("userId", "==", userId)),
      (snap) => {
        setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    return () => {
      unsubUser();
      unsubPosts();
    };
  }, [userId, isMyProfile, reduxUser]);

  const handleLogout = async () => {
    await signOut(auth);
    dispatch(clearUser());
    navigation.replace("Login");
  };

  const startChat = async () => {
    const myId = reduxUser?.uid;
    if (!myId || !userId) return;

    const chatId = getChatId(myId, userId);

    await setDoc(
      doc(db, "chats", chatId),
      {
        participants: [myId, userId],
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    navigation.navigate("Chat", {
      chatId,
      userId,
      username: userData?.name || userData?.username || "User",
    });
  };

  const openFollowers = () => {
    navigation.navigate("FollowersList", {
      userId,
      type: "followers",
      title: "Followers",
    });
  };

  const openFollowing = () => {
    navigation.navigate("FollowersList", {
      userId,
      type: "following",
      title: "Following",
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
        <Text style={styles.emptyText}>User not found</Text>
      </View>
    );
  }

  const displayName = userData?.name || userData?.username || "Profile";
  const username = userData?.username || userData?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topBar}>
              {!isMyProfile ? (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backPlaceholder} />
              )}

              <Text style={styles.topBarName} numberOfLines={1}>{displayName}</Text>

              {isMyProfile ? (
                <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.headerBtn}>
                  <Text style={styles.headerBtnText}>Settings</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.backPlaceholder} />
              )}
            </View>

            <View style={styles.profileCard}>
              <View style={styles.profileTop}>
                {userData?.photoURL ? (
                  <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarInitial}>{avatarLetter}</Text>
                  </View>
                )}

                <View style={styles.statsRow}>
                  <TouchableOpacity style={styles.stat} onPress={openFollowers} activeOpacity={0.8}>
                    <Text style={styles.statNum}>{followers.length}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </TouchableOpacity>

                  <View style={styles.statDivider} />

                  <TouchableOpacity style={styles.stat} onPress={openFollowing} activeOpacity={0.8}>
                    <Text style={styles.statNum}>{following.length}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </TouchableOpacity>

                  <View style={styles.statDivider} />

                  <View style={styles.stat}>
                    <Text style={styles.statNum}>{posts.length}</Text>
                    <Text style={styles.statLabel}>Posts</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bioArea}>
                <Text style={styles.bioName}>{displayName}</Text>
                {!!username && <Text style={styles.usernameText}>{username}</Text>}
                {!!userData?.bio && <Text style={styles.bioText}>{userData.bio}</Text>}
              </View>

              <View style={styles.actionRow}>
                {isMyProfile ? (
                  <>
                    <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate("EditProfile")}>
                      <Text style={styles.outlineBtnText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.outlineBtn, styles.dangerBtn]} onPress={handleLogout}>
                      <Text style={styles.dangerBtnText}>Logout</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <FollowButton userId={userId} />
                    <TouchableOpacity style={styles.outlineBtn} onPress={startChat}>
                      <Text style={styles.outlineBtnText}>Message</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>

            <View style={styles.gridHeader}>
              <Text style={styles.gridHeaderText}>Posts</Text>
            </View>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyGridText}>No posts yet</Text>}
        renderItem={({ item }) => (
          <View style={styles.gridCell}>
            {item.mediaUrl ? (
              <Image source={{ uri: item.mediaUrl }} style={styles.gridImg} />
            ) : (
              <View style={[styles.gridImg, styles.gridImgPlaceholder]}>
                <Text style={styles.gridPlaceholderText}>Post</Text>
              </View>
            )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  backBtn: {
    width: 74,
    height: 36,
    justifyContent: "center",
  },
  backPlaceholder: {
    width: 74,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "700",
  },
  topBarName: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.font.lg,
    fontWeight: "900",
    color: theme.colors.text,
  },
  headerBtn: {
    width: 74,
    alignItems: "flex-end",
  },
  headerBtnText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "700",
  },

  profileCard: {
    marginHorizontal: 14,
    marginTop: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  profileTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 18,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    color: theme.colors.primary,
    fontSize: 34,
    fontWeight: "900",
  },
  statsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statNum: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: "900",
  },
  statLabel: {
    color: theme.colors.textSub,
    fontSize: theme.font.xs,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 34,
    backgroundColor: theme.colors.border,
  },

  bioArea: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  bioName: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontWeight: "800",
  },
  usernameText: {
    color: theme.colors.textSub,
    fontSize: theme.font.sm,
    marginTop: 2,
  },
  bioText: {
    color: theme.colors.textSub,
    fontSize: theme.font.sm,
    marginTop: 8,
    lineHeight: 19,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  outlineBtn: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceHigh,
  },
  outlineBtnText: {
    color: theme.colors.text,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  dangerBtn: {
    borderColor: theme.colors.danger,
    backgroundColor: "transparent",
  },
  dangerBtnText: {
    color: theme.colors.danger,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },

  gridHeader: {
    paddingTop: 18,
    paddingBottom: 10,
    alignItems: "center",
  },
  gridHeaderText: {
    color: theme.colors.textSub,
    fontSize: theme.font.xs,
    fontWeight: "900",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  gridCell: {
    flex: 1 / 3,
    aspectRatio: 1,
    padding: 1,
  },
  gridImg: {
    width: "100%",
    height: "100%",
    backgroundColor: theme.colors.surface,
  },
  gridImgPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  gridPlaceholderText: {
    color: theme.colors.textMuted,
    fontSize: theme.font.xs,
  },
  emptyText: {
    color: theme.colors.textSub,
    fontSize: theme.font.md,
  },
  emptyGridText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 40,
    fontSize: theme.font.md,
  },
});
