// screens/profile/EditProfileScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, StyleSheet, ActivityIndicator, Image, StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { updateUserProfile } from "../../store/slices/authSlice";
import { auth, db } from "../../config/firebase";
import { uploadToCloudinary } from "../../utils/cloudinary";
import { theme } from "../../theme";

export default function EditProfileScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const reduxUser = useSelector((state: RootState) => state.auth.user);

  const [name, setName] = useState(reduxUser?.name || "");
  const [bio, setBio] = useState(reduxUser?.bio || "");
  const [photoURL, setPhotoURL] = useState(reduxUser?.photoURL || "");
  const [newPhoto, setNewPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets?.length) {
      setNewPhoto(result.assets[0]);
    }
  };

  const handleSave = async () => {
    if (!auth.currentUser?.uid) return;
    if (!name.trim()) { Alert.alert("Name required"); return; }
    try {
      setLoading(true);
      let finalPhotoURL = photoURL;
      if (newPhoto) {
        finalPhotoURL = await uploadToCloudinary(newPhoto);
      }
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        name: name.trim(),
        bio: bio.trim(),
        photoURL: finalPhotoURL,
      });

      // ✅ Redux update — baaki screens instantly update ho jayenge
      dispatch(updateUserProfile({
        name: name.trim(),
        bio: bio.trim(),
        photoURL: finalPhotoURL,
      }));

      Alert.alert("Saved!", "Profile updated successfully.");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayPhoto = newPhoto?.uri || photoURL;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <TouchableOpacity style={styles.avatarSection} onPress={pickPhoto}>
        {displayPhoto ? (
          <Image source={{ uri: displayPhoto }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarInitial}>
              {name.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>📷</Text>
        </View>
        <Text style={styles.changePhotoText}>Change Photo</Text>
      </TouchableOpacity>

      <View style={styles.form}>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>NAME</Text>
          <TextInput
            placeholder="Your name"
            placeholderTextColor={theme.colors.textMuted}
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
        </View>
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>BIO</Text>
          <TextInput
            placeholder="Tell people about yourself"
            placeholderTextColor={theme.colors.textMuted}
            value={bio}
            onChangeText={setBio}
            multiline
            style={[styles.input, { minHeight: 90, textAlignVertical: "top" }]}
          />
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        >
          {loading
            ? <ActivityIndicator color={theme.colors.bg} />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
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
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: theme.colors.primary, fontSize: 32, lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.text },
  avatarSection: { alignItems: "center", paddingVertical: 28 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: theme.colors.primary },
  avatarFallback: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 2, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontSize: 36, color: theme.colors.primary, fontWeight: "800" },
  editBadge: {
    position: "absolute", bottom: 38, right: "34%",
    backgroundColor: theme.colors.primary,
    borderRadius: 14, width: 28, height: 28,
    justifyContent: "center", alignItems: "center",
  },
  editBadgeText: { fontSize: 13 },
  changePhotoText: { color: theme.colors.primary, fontSize: 13, fontWeight: "600", marginTop: 8 },
  form: { paddingHorizontal: 20, gap: 16 },
  fieldWrap: {},
  fieldLabel: { fontSize: 11, fontWeight: "700", color: theme.colors.textMuted, marginBottom: 6, letterSpacing: 1 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 13, color: theme.colors.text, fontSize: 15,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md, padding: 15, alignItems: "center", marginTop: 8,
  },
  saveBtnText: { color: theme.colors.bg, fontWeight: "800", fontSize: 15 },
});