// screens/home/CreatePostScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { addPost } from "../../store/slices/postsSlice";
import { db } from "../../config/firebase";
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
      Alert.alert("Empty Post", "Add a caption or photo first.");
      return;
    }

    if (!currentUser) return;

    try {
      setLoading(true);

      let mediaUrl: string | null = null;
      if (media) {
        mediaUrl = await uploadToCloudinary(media);
      }

      const docRef = await addDoc(collection(db, "posts"), {
        caption: caption.trim(),
        mediaUrl,
        mediaType: media ? "image" : null,
        userId: currentUser.uid,
        username: currentUser.name || currentUser.email || "User",
        likes: [],
        createdAt: serverTimestamp(),
      });

      dispatch(
        addPost({
          id: docRef.id,
          caption: caption.trim(),
          mediaUrl,
          mediaType: media ? "image" : null,
          userId: currentUser.uid,
          username: currentUser.name || currentUser.email || "User",
          likes: [],
          createdAt: new Date().toISOString(),
        })
      );

      setCaption("");
      setMedia(null);
    } catch (error: any) {
      Alert.alert("Post Failed", error?.message || "Post could not be created");
    } finally {
      setLoading(false);
    }
  };

  const displayName = currentUser?.name || currentUser?.email || "User";

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.avatar}>
          {currentUser?.photoURL ? (
            <Image source={{ uri: currentUser.photoURL }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
          )}
        </View>

        <TextInput
          placeholder="Share something with your followers"
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
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={pickImage} style={styles.photoBtn}>
          <Text style={styles.photoBtnText}>Add Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePost}
          disabled={loading || (!caption.trim() && !media)}
          style={[styles.postBtn, (loading || (!caption.trim() && !media)) && styles.disabledBtn]}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.bg} />
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
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: "900",
    fontSize: theme.font.md,
  },
  input: {
    flex: 1,
    minHeight: 56,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: theme.font.sm,
    textAlignVertical: "top",
  },
  previewWrap: {
    marginTop: 12,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  preview: {
    width: "100%",
    height: 220,
    backgroundColor: theme.colors.surfaceHigh,
  },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radius.sm,
  },
  removeText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: theme.font.xs,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  photoBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  photoBtnText: {
    color: theme.colors.text,
    fontWeight: "800",
    fontSize: theme.font.sm,
  },
  postBtn: {
    minWidth: 90,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  disabledBtn: {
    opacity: 0.55,
  },
  postBtnText: {
    color: theme.colors.bg,
    fontWeight: "900",
    fontSize: theme.font.sm,
  },
});
