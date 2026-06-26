// screens/stories/StoryViewer.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from "react-native";
import { deleteDoc, doc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

export default function StoryViewerScreen({ route, navigation }: any) {
  const singleStory = route?.params?.story;
  const storiesParam = route?.params?.stories;
  const initialIndex = route?.params?.initialIndex || 0;

  const stories = useMemo(() => {
    if (Array.isArray(storiesParam) && storiesParam.length) return storiesParam;
    if (singleStory) return [singleStory];
    return [];
  }, [storiesParam, singleStory]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  const myId = auth.currentUser?.uid;
  const story = stories[currentIndex];

  useEffect(() => {
    setProgress(0);

    let value = 0;

    const timer = setInterval(() => {
      value += 0.01;
      setProgress(value);

      if (value >= 1) {
        clearInterval(timer);

        if (currentIndex < stories.length - 1) {
          setCurrentIndex((prev: number) => prev + 1);
        } else {
          navigation.goBack();
        }
      }
    }, 50);

    return () => clearInterval(timer);
  }, [currentIndex, stories.length, navigation]);

  if (!story) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Story not found</Text>
      </View>
    );
  }

  const isMyStory = story.userId === myId;

  const goNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((prev: number) => prev + 1);
    } else {
      navigation.goBack();
    }
  };

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev: number) => prev - 1);
    }
  };

  const deleteStory = () => {
    if (!story?.id) {
      Alert.alert("Error", "Story id missing");
      return;
    }

    if (!isMyStory) {
      Alert.alert("Error", "You can delete only your own story");
      return;
    }

    Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "stories", story.id));
            navigation.goBack();
          } catch (error: any) {
            Alert.alert("Error", error?.message || "Story delete failed");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(progress, 1) * 100}%` },
          ]}
        />
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      {isMyStory && (
        <TouchableOpacity onPress={deleteStory} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}

      <Image
        source={{ uri: story.mediaUrl || story.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.touchLayer}>
        <TouchableOpacity style={styles.leftTap} onPress={goPrevious} />
        <TouchableOpacity style={styles.rightTap} onPress={goNext} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.username}>{story.username || "Unknown"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  center: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    color: "#fff",
  },
  progressTrack: {
    position: "absolute",
    top: 42,
    left: 14,
    right: 14,
    height: 3,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.25)",
    zIndex: 20,
    overflow: "hidden",
  },
  progressFill: {
    height: 3,
    backgroundColor: "#fff",
  },
  backBtn: {
    position: "absolute",
    top: 54,
    left: 20,
    zIndex: 20,
  },
  backText: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 34,
  },
  deleteBtn: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 20,
    backgroundColor: theme.colors.danger,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },
  image: {
    width: "100%",
    height: "82%",
  },
  touchLayer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    zIndex: 10,
  },
  leftTap: {
    flex: 1,
  },
  rightTap: {
    flex: 1,
  },
  footer: {
    position: "absolute",
    left: 20,
    bottom: 50,
    right: 20,
    zIndex: 20,
  },
  username: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
});