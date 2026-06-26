// screens/stories/CreateStoryScreen.tsx
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { theme } from "../../theme";

export default function CreateStoryScreen({ navigation }: any) {
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickStory = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setMedia(result.assets[0]);
    }
  };

  const uploadStory = async () => {
    if (!media) {
      Alert.alert("No Photo Selected", "Select a photo first.");
      return;
    }

    if (!auth.currentUser?.uid) {
      Alert.alert("Error", "You need to login first.");
      return;
    }

    try {
      setLoading(true);

      const mediaUrl = await uploadToCloudinary(media);

      await addDoc(collection(db, "stories"), {
        userId: auth.currentUser.uid,
        username: auth.currentUser.displayName || auth.currentUser.email || "User",
        mediaUrl,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Story Shared", "Your story is live.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Upload Failed", error?.message || "Story could not be uploaded");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
        <View style={styles.headerSpacer} />
      </View>

      <TouchableOpacity style={styles.pickArea} onPress={pickStory} activeOpacity={0.85}>
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>Select a photo</Text>
            <Text style={styles.placeholderSub}>Share a moment with your followers</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.bottomArea}>
        {media && (
          <TouchableOpacity onPress={pickStory} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={uploadStory}
          disabled={loading || !media}
          style={[styles.uploadBtn, (!media || loading) && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.bg} />
          ) : (
            <Text style={styles.uploadBtnText}>Share Story</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: theme.colors.bg,
  },
  backBtn: {
    width: 74,
    height: 36,
    justifyContent: "center",
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: theme.font.lg,
    fontWeight: "900",
    color: theme.colors.text,
  },
  headerSpacer: {
    width: 74,
  },
  pickArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 12,
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  placeholderTitle: {
    color: theme.colors.text,
    fontSize: theme.font.lg,
    fontWeight: "900",
  },
  placeholderSub: {
    color: theme.colors.textSub,
    fontSize: theme.font.sm,
    marginTop: 8,
    textAlign: "center",
  },
  bottomArea: {
    padding: 16,
    gap: 10,
  },
  changeBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 13,
    alignItems: "center",
  },
  changeBtnText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: theme.font.sm,
  },
  uploadBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: 15,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.5,
  },
  uploadBtnText: {
    color: theme.colors.bg,
    fontWeight: "900",
    fontSize: theme.font.md,
  },
});

