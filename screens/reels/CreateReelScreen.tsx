// screens/reels/CreateReelScreen.tsx
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

const CLOUD_NAME = "dgxghowdt";
const UPLOAD_PRESET = "t6xghzi5";

export default function CreateReelScreen({ navigation }: any) {
  const [media, setMedia] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const myUser = useSelector((state: RootState) => state.auth.user);

  const pickMedia = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Allow media access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "videos" as any,
      quality: 0.5,
      videoMaxDuration: 30,
    });
    if (!result.canceled && result.assets?.length) {
      setMedia(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!media) { Alert.alert("No video selected"); return; }
    if (!myUser) return;

    try {
      setLoading(true);

      // Step 1: Simple naam se cache mein copy
      setProgress("Preparing...");
      const destUri = `${FileSystem.cacheDirectory}reel${Date.now()}.mp4`;
      await FileSystem.copyAsync({ from: media.uri, to: destUri });

      // Step 2: Base64 convert
      setProgress("Processing...");
      const base64 = await FileSystem.readAsStringAsync(destUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Step 3: Upload — public_id bilkul mat bhejo
      setProgress("Uploading...");
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file: `data:video/mp4;base64,${base64}`,
            upload_preset: UPLOAD_PRESET,
            // ✅ public_id nahi bhej rahe — Cloudinary khud generate karega
          }),
        }
      );

      const json = await response.json();
      console.log("Cloudinary:", JSON.stringify(json));

      if (!json.secure_url) {
        throw new Error(json.error?.message || "Upload failed");
      }

      // Step 4: Firestore mein save
      setProgress("Saving...");
      await addDoc(collection(db, "reels"), {
        mediaUrl: json.secure_url,
        mediaType: "video",
        caption: caption.trim(),
        userId: myUser.uid,
        username: myUser.name || myUser.email,
        likes: [],
        createdAt: serverTimestamp(),
      });

      await FileSystem.deleteAsync(destUri, { idempotent: true });
      Alert.alert("Success", "Reel uploaded!");
      navigation.goBack();

    } catch (e: any) {
      console.log("Error:", e.message);
      Alert.alert("Upload Failed", e.message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Reel</Text>
        <View style={{ width: 36 }} />
      </View>

      <TouchableOpacity style={styles.pickArea} onPress={pickMedia} activeOpacity={0.8}>
        {media ? (
          <View style={styles.selectedWrap}>
            <Text style={styles.selectedIcon}>▶</Text>
            <Text style={styles.selectedName} numberOfLines={1}>
              {media.fileName || "Video selected"}
            </Text>
            <Text style={styles.selectedDuration}>
              {media.duration ? `${Math.round(media.duration / 1000)}s` : ""}
            </Text>
            <Text style={styles.selectedSub}>Tap to change</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>▶</Text>
            <Text style={styles.placeholderTitle}>Select a Video</Text>
            <Text style={styles.placeholderSub}>Max 30 seconds</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.captionWrap}>
        <TextInput
          placeholder="Write a caption..."
          placeholderTextColor={theme.colors.textMuted}
          value={caption}
          onChangeText={setCaption}
          multiline
          style={styles.captionInput}
        />
      </View>

      {!!progress && (
        <Text style={styles.progressText}>{progress}</Text>
      )}

      <View style={styles.bottom}>
        <TouchableOpacity
          onPress={handleUpload}
          disabled={loading || !media}
          style={[styles.uploadBtn, (!media || loading) && { opacity: 0.45 }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.uploadBtnText}>Share Reel</Text>
          }
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: theme.colors.primary, fontSize: 32, lineHeight: 36 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: theme.colors.text },
  pickArea: {
    flex: 1, margin: 16,
    borderRadius: theme.radius.lg,
    borderWidth: 1.5, borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.surface,
    justifyContent: "center", alignItems: "center",
  },
  placeholder: { alignItems: "center", gap: 10 },
  placeholderIcon: { fontSize: 44, color: theme.colors.primary },
  placeholderTitle: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  placeholderSub: { fontSize: 13, color: theme.colors.textMuted },
  selectedWrap: { alignItems: "center", gap: 8 },
  selectedIcon: { fontSize: 44, color: theme.colors.primary },
  selectedName: { fontSize: 14, fontWeight: "600", color: theme.colors.text, maxWidth: 240, textAlign: "center" },
  selectedDuration: { fontSize: 13, color: theme.colors.primary, fontWeight: "600" },
  selectedSub: { fontSize: 12, color: theme.colors.textMuted },
  captionWrap: { marginHorizontal: 16, marginBottom: 12 },
  captionInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14, color: theme.colors.text, fontSize: 14,
    minHeight: 80, textAlignVertical: "top",
  },
  progressText: {
    textAlign: "center", color: theme.colors.primary,
    fontSize: 13, fontWeight: "600", marginBottom: 8,
  },
  bottom: { paddingHorizontal: 16, paddingBottom: 24 },
  uploadBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 15, alignItems: "center",
  },
  uploadBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});