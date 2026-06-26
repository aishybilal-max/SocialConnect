import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch, Alert, StatusBar, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function SettingsScreen({ navigation }: any) {
  const [notifs, setNotifs] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel" },
      { text: "Logout", style: "destructive", onPress: async () => {
        await signOut(auth);
        navigation.replace("Login");
      }},
    ]);
  };

  const sections = [
    {
      title: "Account",
      items: [
        { label: "Edit Profile", icon: "✏️", onPress: () => navigation.navigate("EditProfile") },
        { label: "Change Password", icon: "🔑", onPress: () => navigation.navigate("ForgotPassword") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Push Notifications", icon: "🔔", toggle: true, value: notifs, onToggle: setNotifs },
        { label: "Dark Mode", icon: "🌙", toggle: true, value: darkMode, onToggle: setDarkMode },
      ],
    },
    {
      title: "About",
      items: [
        { label: "Version 1.0.0", icon: "ℹ️", onPress: () => {} },
        { label: "Privacy Policy", icon: "📄", onPress: () => {} },
      ],
    },
  ];

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
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item: any, idx) => (
                <TouchableOpacity
                  key={item.label}
                  onPress={item.onPress}
                  activeOpacity={item.toggle ? 1 : 0.7}
                  style={[styles.item, idx < section.items.length - 1 && styles.itemBorder]}
                >
                  <Text style={styles.itemIcon}>{item.icon}</Text>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.toggle ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                      thumbColor={theme.colors.text}
                    />
                  ) : (
                    <Text style={styles.arrow}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  backText: { color: theme.colors.primary, fontSize: 32, lineHeight: 32 },
  headerTitle: { fontSize: 17, fontWeight: "800", color: theme.colors.text },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 11, fontWeight: "700", color: theme.colors.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  sectionCard: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, borderWidth: 1, borderColor: theme.colors.border, overflow: "hidden" },
  item: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  itemIcon: { fontSize: 20, width: 28 },
  itemLabel: { flex: 1, color: theme.colors.text, fontSize: 15 },
  arrow: { color: theme.colors.textMuted, fontSize: 22 },
  logoutBtn: { margin: 24, backgroundColor: theme.colors.accentSoft, borderRadius: theme.radius.lg, padding: 16, alignItems: "center", borderWidth: 1, borderColor: theme.colors.danger },
  logoutText: { color: theme.colors.danger, fontWeight: "700", fontSize: 16 },
});
