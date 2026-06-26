import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) { Alert.alert("Enter your email address"); return; }
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>‹  Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.icon}>🔑</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send a reset link</Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Reset link sent! Check your email.</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.btn}>
              <Text style={styles.btnText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleReset} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
              <Text style={styles.btnText}>{loading ? "Sending..." : "Send Reset Link"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  backBtn: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 10 },
  backText: { color: theme.colors.primary, fontSize: 16, fontWeight: "600" },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  icon: { fontSize: 52, textAlign: "center", marginBottom: 16 },
  title: { fontSize: 26, fontWeight: "800", color: theme.colors.text, textAlign: "center" },
  subtitle: { fontSize: 14, color: theme.colors.textSub, textAlign: "center", marginTop: 8, marginBottom: 32 },
  card: { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg, padding: 24, borderWidth: 1, borderColor: theme.colors.border },
  label: { fontSize: 11, fontWeight: "700", color: theme.colors.textMuted, marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: theme.colors.surfaceHigh, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, padding: 13, color: theme.colors.text, fontSize: 15, marginBottom: 16 },
  btn: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.md, padding: 15, alignItems: "center" },
  btnText: { color: theme.colors.bg, fontWeight: "800", fontSize: 15 },
  successBox: { alignItems: "center", gap: 16 },
  successIcon: { fontSize: 48 },
  successText: { color: theme.colors.text, fontSize: 16, textAlign: "center" },
});
