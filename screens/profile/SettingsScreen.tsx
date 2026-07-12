// screens/profile/SettingsScreen.tsx
import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, ScrollView, Image,
} from "react-native";
import { signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { clearUser } from "../../store/slices/authSlice";
import { auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          await signOut(auth);
          dispatch(clearUser());
          navigation.replace("Login");
        },
      },
    ]);
  };

  const Row = ({
    label, onPress, danger, subtitle,
  }: {
    label: string; onPress: () => void; danger?: boolean; subtitle?: string;
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, danger && { color: theme.colors.danger }]}>{label}</Text>
        {!!subtitle && <Text style={styles.rowSubtitle}>{subtitle}</Text>}
      </View>
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          {user?.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.profileAvatar} />
          ) : (
            <View style={styles.profileAvatarFallback}>
              <Text style={styles.profileAvatarText}>
                {(user?.name || "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{user?.name || "Unknown"}</Text>
            <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          </View>
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.section}>
          <Row
            label="Edit Profile"
            subtitle="Update name, bio and photo"
            onPress={() => navigation.navigate("EditProfile")}
          />
          <Row
            label="Change Password"
            subtitle="Send a password reset email"
            onPress={() => navigation.navigate("ForgotPassword")}
          />
        </View>

        {/* Content — ✅ UserProfile navigate karo with myId */}
        <Text style={styles.sectionLabel}>CONTENT</Text>
        <View style={styles.section}>
          <Row
            label="My Profile & Posts"
            subtitle="View your posts and profile"
            onPress={() => {
              if (user?.uid) {
                navigation.navigate("UserProfile", { userId: user.uid });
              }
            }}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.section}>
          <Row
            label="About SocialConnect"
            subtitle="Version 1.0.0"
            onPress={() =>
              Alert.alert(
                "SocialConnect",
                "Version 1.0.0\nBuilt with React Native & Firebase.\n\nA social platform to connect, share and inspire."
              )
            }
          />
        </View>

        {/* Logout */}
        <Text style={styles.sectionLabel}>SESSION</Text>
        <View style={styles.section}>
          <Row
            label="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.version}>SocialConnect v1.0.0</Text>
      </ScrollView>
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

  profileCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    margin: 16, padding: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1, borderColor: theme.colors.border,
  },
  profileAvatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, borderColor: theme.colors.primary,
  },
  profileAvatarFallback: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1.5, borderColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  profileAvatarText: { fontSize: 22, fontWeight: "700", color: theme.colors.primary },
  profileName: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  profileEmail: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: theme.colors.textMuted,
    letterSpacing: 1, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: theme.colors.border,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: theme.colors.border,
  },
  rowLabel: { fontSize: 15, color: theme.colors.text },
  rowSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  rowArrow: { fontSize: 20, color: theme.colors.textMuted },

  version: {
    textAlign: "center", color: theme.colors.textMuted,
    fontSize: 12, marginVertical: 32,
  },
});