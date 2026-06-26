// screens/profile/FollowersListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

export default function FollowersListScreen({ route, navigation }: any) {
  const { data, title } = route.params;

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        const result = await Promise.all(
          (data || []).map(async (uid: string) => {
            const snap = await getDoc(doc(db, "users", uid));

            if (snap.exists()) {
              return {
                uid,
                ...snap.data(),
              };
            }

            return null;
          })
        );

        setUsers(result.filter(Boolean));
      } catch (error) {
        console.log(error);
      }

      setLoading(false);
    };

    fetchUsers();
  }, [data]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* LIST */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.uid}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* AVATAR */}
            <Image
              source={{
                uri:
                  item.photoURL ||
                  "https://i.pravatar.cc/150?img=" + item.uid,
              }}
              style={styles.avatar}
            />

            {/* INFO */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>
                {item.name || item.username || "User"}
              </Text>

              <Text style={styles.sub}>
                @{item.username || "unknown"}
              </Text>
            </View>

            {/* BUTTON */}
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>View</Text>
            </TouchableOpacity>
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
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: theme.colors.surface,
  },

  back: {
    fontSize: 28,
    color: theme.colors.primary,
  },

  title: {
    fontSize: 16,
    fontWeight: "800",
    color: theme.colors.text,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 6,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
  },

  name: {
    fontSize: 14,
    fontWeight: "700",
    color: theme.colors.text,
  },

  sub: {
    fontSize: 12,
    color: theme.colors.textSub,
  },

  btn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});