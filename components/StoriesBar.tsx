// components/StoriesBar.tsx
import React, { useEffect, useState } from "react";
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, StyleSheet,
} from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { db } from "../config/firebase";
import { theme } from "../theme";

export default function StoriesBar({ navigation }: any) {
  const [stories, setStories] = useState<any[]>([]);
  const myUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // ✅ Apni stories alag nikalo
  const myStories = stories.filter((s) => s.userId === myUser?.uid);
  // Baaki sab
  const othersStories = stories.filter((s) => s.userId !== myUser?.uid);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* ADD / MY STORY */}
      <TouchableOpacity
        onPress={() =>
          myStories.length > 0
            ? navigation.navigate("StoryViewer", { story: myStories[0] })
            : navigation.navigate("CreateStory")
        }
        style={styles.storyItem}
      >
        <View style={[styles.ring, myStories.length > 0 && styles.ringActive]}>
          {myStories.length > 0 && myStories[0].mediaUrl ? (
            <Image source={{ uri: myStories[0].mediaUrl }} style={styles.storyImg} />
          ) : myUser?.photoURL ? (
            <Image source={{ uri: myUser.photoURL }} style={styles.storyImg} />
          ) : (
            <View style={[styles.storyImg, styles.storyFallback]}>
              <Text style={styles.storyInitial}>
                {(myUser?.name || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {/* Plus badge */}
        <View style={styles.addBadge}>
          <Text style={styles.addBadgeText}>+</Text>
        </View>
        <Text style={styles.storyLabel} numberOfLines={1}>Your Story</Text>
      </TouchableOpacity>

      {/* OTHER USERS' STORIES */}
      {othersStories.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate("StoryViewer", { story: item })}
          style={styles.storyItem}
        >
          <View style={[styles.ring, styles.ringActive]}>
            {item.mediaUrl ? (
              <Image source={{ uri: item.mediaUrl }} style={styles.storyImg} />
            ) : (
              <View style={[styles.storyImg, styles.storyFallback]}>
                <Text style={styles.storyInitial}>
                  {(item.username || "?").charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.storyLabel} numberOfLines={1}>
            {(item.username || "").split(" ")[0]}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const STORY_SIZE = 62;

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 4, gap: 14, alignItems: "flex-start" },

  storyItem: { alignItems: "center", width: STORY_SIZE + 4, position: "relative" },

  ring: {
    width: STORY_SIZE + 4, height: STORY_SIZE + 4,
    borderRadius: (STORY_SIZE + 4) / 2,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: 2,
    justifyContent: "center", alignItems: "center",
  },
  ringActive: { borderColor: theme.colors.primary },

  storyImg: {
    width: STORY_SIZE, height: STORY_SIZE,
    borderRadius: STORY_SIZE / 2,
  },
  storyFallback: {
    backgroundColor: theme.colors.surfaceHigh,
    justifyContent: "center", alignItems: "center",
  },
  storyInitial: { fontSize: 22, fontWeight: "700", color: theme.colors.primary },

  addBadge: {
    position: "absolute",
    bottom: 18, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: theme.colors.bg,
  },
  addBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800", lineHeight: 16 },

  storyLabel: {
    color: theme.colors.textSub,
    fontSize: 11, marginTop: 5,
    textAlign: "center", width: STORY_SIZE + 4,
  },
});
