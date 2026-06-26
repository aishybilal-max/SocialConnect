// screens/profile/ProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, Image, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator, StatusBar
} from "react-native";
import {
  doc, getDoc, onSnapshot, collection, query, where
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { auth, db } from "../../config/firebase";
import FollowButton from "../../components/FollowButton";
import { theme } from "../../theme";

export default function ProfileScreen({ route, navigation }: any) {
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const routeUserId = route?.params?.userId;
  const userId = routeUserId || reduxUser?.uid;
  const isMyProfile = userId === reduxUser?.uid;

  const [userData, setUserData] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followers, setFollowers] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // USER DATA
    const unsubUser = onSnapshot(doc(db, "users", userId), (snap) => {
      const data = snap.data();
      setUserData(data || null);

      setFollowers(data?.followers || []);
      setFollowing(data?.following || []);
      setLoading(false);
    });

    // POSTS
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
  }, [userId]);

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
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.name}>
          {userData?.name || userData?.username}
        </Text>
      </View>

      {/* PROFILE INFO */}
      <View style={styles.profileBox}>
        <Image
          source={{ uri: userData.photoURL || "https://i.pravatar.cc/150" }}
          style={styles.avatar}
        />

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.num}>{posts.length}</Text>
            <Text style={styles.label}>Posts</Text>
          </View>

          <TouchableOpacity
            style={styles.stat}
            onPress={() =>
              navigation.navigate("FollowersList", {
                data: followers,
                title: "Followers",
              })
            }
          >
            <Text style={styles.num}>{followers.length}</Text>
            <Text style={styles.label}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.stat}
            onPress={() =>
              navigation.navigate("FollowersList", {
                data: following,
                title: "Following",
              })
            }
          >
            <Text style={styles.num}>{following.length}</Text>
            <Text style={styles.label}>Following</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FOLLOW BUTTON */}
      {!isMyProfile && <FollowButton userId={userId} />}

      {/* POSTS GRID */}
      <FlatList
        data={posts}
        numColumns={3}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Image source={{ uri: item.mediaUrl }} style={styles.gridImg} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
  },

  profileBox: {
    alignItems: "center",
    padding: 15,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },

  stat: {
    alignItems: "center",
  },

  num: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },

  label: {
    fontSize: 12,
    color: "gray",
  },

  gridImg: {
    width: 120,
    height: 120,
    margin: 1,
  },
});