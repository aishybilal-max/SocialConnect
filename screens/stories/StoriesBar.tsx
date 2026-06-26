import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

export default function StoriesBar({ navigation }: any) {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, "stories"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {/* ADD STORY */}
      <TouchableOpacity
        onPress={() => navigation.navigate("CreateStory")}
        style={styles.addItem}
      >
        <View style={styles.addCircle}>
          <Text style={styles.addPlus}>+</Text>
        </View>
        <Text style={styles.label}>Your Story</Text>
      </TouchableOpacity>

      {/* STORY ITEMS */}
      {stories.map((item) => (
        <TouchableOpacity
          key={item.id}
          onPress={() => navigation.navigate("StoryViewer", { story: item })}
          style={styles.storyItem}
        >
          <View style={styles.ring}>
            <Image source={{ uri: item.mediaUrl }} style={styles.storyImg} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {(item.username || "").slice(0, 8)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  addItem:   { alignItems: "center", marginRight: 16, width: 64 },
  addCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 2, borderColor: theme.colors.primary,
    borderStyle: "dashed",
    justifyContent: "center", alignItems: "center",
  },
  addPlus: { color: theme.colors.primary, fontSize: 30, lineHeight: 34 },

  storyItem: { alignItems: "center", marginRight: 16, width: 64 },
  ring: {
    padding: 2.5,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  storyImg: {
    width: 58, height: 58, borderRadius: 29,
    borderWidth: 2, borderColor: theme.colors.bg,
  },
  label: {
    color: theme.colors.textSub,
    fontSize: 10,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 64,
  },
});