// screens/home/EditPostScreen.tsx
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, StatusBar,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { theme } from "../../theme";

export default function EditPostScreen({ route, navigation }: any) {
  const { post } = route.params;
  const [caption, setCaption] = useState(post.caption || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!caption.trim()) {
      Alert.alert("Caption required");
      return;
    }
    try {
      setLoading(true);
      await updateDoc(doc(db, "posts", post.id), {
        caption: caption.trim(),
      });
      Alert.alert("Updated", "Post updated successfully.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Post</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Write something..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          style={styles.input}
          autoFocus
        />
        <Text style={styles.hint}>
          Note: Only caption can be edited. Image cannot be changed.
        </Text>

        <TouchableOpacity
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveBtn, loading && { opacity: 0.6 }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
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
  form: { padding: 20, gap: 12 },
  label: {
    fontSize: 12, fontWeight: "700", color: theme.colors.textMuted,
    letterSpacing: 0.8, marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 14, color: theme.colors.text, fontSize: 15,
    minHeight: 120, textAlignVertical: "top",
  },
  hint: { fontSize: 12, color: theme.colors.textMuted, lineHeight: 18 },
  saveBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14, alignItems: "center", marginTop: 8,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelBtn: {
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: 14, alignItems: "center",
  },
  cancelBtnText: { color: theme.colors.textSub, fontWeight: "600", fontSize: 15 },
});