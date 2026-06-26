// screens/profile/SettingsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  StatusBar,
  ScrollView,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function SettingsScreen({ navigation }: any) {
  const [notifs, setNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await signOut(auth);
          navigation.replace("Login");
        },
      },
    ]);
  };

  const sections = [
    {
      title: "Account",
      items: [
        { label: "Edit Profile", onPress: () => navigation.navigate("EditProfile") },
        { label: "Change Password", onPress: () => navigation.navigate("ForgotPassword") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Push Notifications", toggle: true, value: notifs, onToggle: setNotifs },
        { label: "Dark Mode", toggle: true, value: darkMode, onToggle: setDarkMode },
      ],
    },
    {
      title: "About",
      items: [
        { label: "Version 1.0.0", onPress: () => {} },
        { label: "Privacy Policy", onPress: () => {} },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionCard}>
              {section.items.map((item: any, idx) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={item.toggle ? 1 : 0.75}
                  style={[styles.item, idx < section.items.length - 1 && styles.itemBorder]}
                >
                  <Text style={styles.itemLabel}>{item.label}</Text>

                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor={theme.colors.text}
                    />
                  ) : (
                    <Text style={styles.itemAction}>Open</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 30,
  },
  section: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: theme.font.xs,
    fontWeight: "900",
    color: theme.colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemLabel: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.md,
    fontWeight: "700",
  },
  itemAction: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  logoutBtn: {
    marginHorizontal: 16,
    marginTop: 24,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.danger,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: "900",
    fontSize: theme.font.md,
  },
});
