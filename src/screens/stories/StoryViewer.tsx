// screens/stories/StoryViewer.tsx
import React from "react";
import {
  View, Image, Text, TouchableOpacity,
  StyleSheet, StatusBar, Dimensions, Alert,
} from "react-native";
import { doc, deleteDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

const { width, height } = Dimensions.get("window");

export default function StoryViewer({ route, navigation }: any) {
  const story = route?.params?.story;
  const myUser = useSelector((state: RootState) => state.auth.user);
  const isMyStory = story?.userId === myUser?.uid;

  if (!story) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textSub }}>Story not found</Text>
      </View>
    );
  }

  const deleteStory = () => {
    Alert.alert("Delete Story", "Yeh story delete karein?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "stories", story.id));
            navigation.goBack();
          } catch (e) {
            Alert.alert("Error", "Story delete nahi hui");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {story.mediaUrl && (
        <Image source={{ uri: story.mediaUrl }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.topOverlay}>
        <View style={styles.userRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(story.username || "?").charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.username}>{story.username || "Unknown"}</Text>
        </View>
        <View style={styles.topBtns}>
          {isMyStory && (
            <TouchableOpacity onPress={deleteStory} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  image: { width, height },
  topOverlay: {
    position: "absolute", top: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.45)", gap: 10,
  },
  userRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { color: theme.colors.primary, fontWeight: "800", fontSize: 15 },
  username: { color: "#fff", fontWeight: "700", fontSize: 14 },
  topBtns: { flexDirection: "row", gap: 8 },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,0,0,0.3)",
    justifyContent: "center", alignItems: "center",
  },
  deleteBtnText: { fontSize: 16 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  closeText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});