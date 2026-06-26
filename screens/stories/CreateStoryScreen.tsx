import React, { useState } from "react";
import {
  View, TouchableOpacity, Text, Image,
  Alert, StyleSheet, ActivityIndicator, StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { theme } from "../../theme";

export default function CreateStoryScreen({ navigation }: any) {
  const [media,   setMedia]   = useState<any>(null);
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
    if (!media) { Alert.alert("No image selected", "Pick an image first."); return; }
    try {
      setLoading(true);
      const mediaUrl = await uploadToCloudinary(media);
      await addDoc(collection(db, "stories"), {
        userId:   auth.currentUser?.uid,
        username: auth.currentUser?.displayName || auth.currentUser?.email || "Unknown",
        mediaUrl,
        createdAt: serverTimestamp(),
      });
      Alert.alert("Posted!", "Your story is live.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Story</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* PICK AREA */}
      <TouchableOpacity
        style={styles.pickArea}
        onPress={pickStory}
        activeOpacity={0.8}
      >
        {media ? (
          <Image source={{ uri: media.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Tap to pick an image</Text>
            <Text style={styles.placeholderSub}>Share a moment</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* BUTTONS */}
      <View style={styles.bottomArea}>
        {media && (
          <TouchableOpacity onPress={pickStory} style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={uploadStory}
          disabled={loading || !media}
          style={[styles.uploadBtn, (!media || loading) && { opacity: 0.5 }]}
        >
          {loading
            ? <ActivityIndicator color={theme.colors.bg} />
            : <Text style={styles.uploadBtnText}>Share Story</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn:     { width: 36, height: 36, justifyContent: "center" },
  backText:    { color: theme.colors.primary, fontSize: 32, lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.text },

  pickArea: {
    flex: 1,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
  },
  preview:        { width: "100%", height: "100%" },
  placeholder:    { flex: 1, justifyContent: "center", alignItems: "center", gap: 8 },
  placeholderIcon:{ fontSize: 52 },
  placeholderText:{ color: theme.colors.text, fontSize: 16, fontWeight: "600" },
  placeholderSub: { color: theme.colors.textMuted, fontSize: 13 },

  bottomArea: { padding: 16, gap: 10 },
  changeBtn: {
    borderWidth: 1.5, borderColor: theme.colors.border,
    borderRadius: theme.radius.md, padding: 13, alignItems: "center",
  },
  changeBtnText: { color: theme.colors.textSub, fontWeight: "600" },
  uploadBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md, padding: 15, alignItems: "center",
  },
  uploadBtnText: { color: theme.colors.bg, fontWeight: "800", fontSize: 15 },
});