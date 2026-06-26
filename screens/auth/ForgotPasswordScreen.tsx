// screens/auth/ForgotPasswordScreen.tsx
import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Email Required", "Enter your email address.");
      return;
    }

    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Reset link could not be sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter your email and we will send a reset link.</Text>

        {sent ? (
          <View style={styles.card}>
            <Text style={styles.successText}>Reset link sent. Please check your email.</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.button}>
              <Text style={styles.buttonText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />

            <TouchableOpacity
              onPress={handleReset}
              disabled={loading}
              style={[styles.button, loading && styles.disabledBtn]}
            >
              <Text style={styles.buttonText}>{loading ? "Sending" : "Send Reset Link"}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  backBtn: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.font.xxl,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: theme.colors.textSub,
    fontSize: theme.font.md,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  inputLabel: {
    color: theme.colors.textSub,
    fontSize: theme.font.xs,
    fontWeight: "900",
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  input: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: theme.font.md,
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: theme.radius.md,
    alignItems: "center",
  },
  disabledBtn: {
    opacity: 0.65,
  },
  buttonText: {
    color: theme.colors.bg,
    fontWeight: "900",
    fontSize: theme.font.md,
  },
  successText: {
    color: theme.colors.text,
    fontSize: theme.font.md,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
});
