// screens/home/CreatePostScreen.tsx
import React, { useState } from "react";
import {
  View, TextInput, TouchableOpacity, Text,
  Image, Alert, StyleSheet, ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addPost } from "../../store/slices/postsSlice";
import { auth, db } from "../../config/firebase";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { theme } from "../../theme";

export default function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      setMedia(result.assets[0]);
    }
  };

  const handlePost = async () => {
    if (!caption.trim() && !media) {
      Alert.alert("Empty post", "Add a caption or image first.");
      return;
    }
    if (!currentUser) return;
    try {
      setLoading(true);
      let mediaUrl: string | null = null;
      if (media) {
        mediaUrl = await uploadToCloudinary(media);
      }

      // Firestore mein save
      const docRef = await addDoc(collection(db, "posts"), {
        caption: caption.trim(),
        mediaUrl,
        mediaType: media ? "image" : null,
        userId: currentUser.uid,
        username: currentUser.name || currentUser.email,
        likes: [],
        createdAt: serverTimestamp(),
      });

      // ✅ Redux store mein bhi add karo (optimistic)
      dispatch(
        addPost({
          id: docRef.id,
          caption: caption.trim(),
          mediaUrl,
          mediaType: media ? "image" : null,
          userId: currentUser.uid,
          username: currentUser.name || currentUser.email,
          likes: [],
          createdAt: new Date().toISOString(),
        })
      );

      setCaption("");
      setMedia(null);
    } catch (error: any) {
      Alert.alert("Post Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          {currentUser?.photoURL ? (
            <Image source={{ uri: currentUser.photoURL }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarEmoji}>
              {(currentUser?.name || "?").charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <TextInput
          placeholder="What's on your mind?"
          placeholderTextColor={theme.colors.textMuted}
          value={caption}
          onChangeText={setCaption}
          multiline
          style={styles.input}
        />
      </View>

      {media && (
        <View style={styles.previewWrap}>
          <Image source={{ uri: media.uri }} style={styles.preview} />
          <TouchableOpacity style={styles.removeBtn} onPress={() => setMedia(null)}>
            <Text style={styles.removeText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={pickImage} style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>📷  Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePost}
          disabled={loading}
          style={[styles.postBtn, loading && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.bg} />
          ) : (
            <Text style={styles.postBtnText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 10,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: theme.colors.primarySoft,
    justifyContent: "center", alignItems: "center",
    overflow: "hidden",
  },
  avatarImg: { width: 38, height: 38, borderRadius: 19 },
  avatarEmoji: { color: theme.colors.primary, fontWeight: "800", fontSize: 16 },
  input: {
    flex: 1, color: theme.colors.text, fontSize: 15,
    minHeight: 48, paddingTop: 4,
  },
  previewWrap: { marginTop: 10, borderRadius: theme.radius.md, overflow: "hidden" },
  preview: { width: "100%", height: 200 },
  removeBtn: {
    position: "absolute", top: 8, right: 8,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 14, width: 28, height: 28,
    justifyContent: "center", alignItems: "center",
  },
  removeText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between", alignItems: "center",
    marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  photoBtn: { padding: 6 },
  photoBtnText: { color: theme.colors.textSub, fontSize: 14 },
  postBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 22, paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  postBtnText: { color: theme.colors.bg, fontWeight: "800", fontSize: 14 },
});