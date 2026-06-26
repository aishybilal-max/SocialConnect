// screens/auth/SignupScreen.tsx
import React, { useState } from "react";
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setUser } from "../../store/slices/authSlice";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
      await updateProfile(cred.user, { displayName: name.trim() });
      await setDoc(doc(db, "users", cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        bio: "",
        photoURL: "",
        createdAt: serverTimestamp(),
      });

      // ✅ Redux mein user set karo
      dispatch(setUser({
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        photoURL: "",
        bio: "",
      }));

      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>✨</Text>
          </View>
          <Text style={styles.appName}>Create Account</Text>
          <Text style={styles.tagline}>join the community 🌸</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: "Full Name", value: name, setter: setName, placeholder: "Your name", secure: false, keyboard: "default" },
            { label: "Email", value: email, setter: setEmail, placeholder: "you@example.com", secure: false, keyboard: "email-address" },
            { label: "Password", value: password, setter: setPassword, placeholder: "Min 6 characters", secure: true, keyboard: "default" },
          ].map((field) => (
            <View key={field.label} style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <TextInput
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.textMuted}
                value={field.value}
                onChangeText={field.setter}
                secureTextEntry={field.secure}
                autoCapitalize="none"
                keyboardType={field.keyboard as any}
                style={styles.input}
              />
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            style={[styles.button, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating account..." : "Get Started"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkRow}>
          <Text style={styles.linkText}>Already have an account? </Text>
          <Text style={styles.linkBold}>Sign in</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 40 },
  logoArea: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1.5, borderColor: theme.colors.accent,
    justifyContent: "center", alignItems: "center", marginBottom: 12,
  },
  logoEmoji: { fontSize: 34 },
  appName: { fontSize: 24, fontWeight: "800", color: theme.colors.text },
  tagline: { fontSize: 13, color: theme.colors.textSub, marginTop: 4 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg,
    padding: 24, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20,
  },
  inputWrapper: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: theme.colors.textSub, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.sm, padding: 13, color: theme.colors.text, fontSize: 15,
  },
  button: {
    backgroundColor: theme.colors.primary, borderRadius: theme.radius.md,
    padding: 15, alignItems: "center", marginTop: 4,
  },
  buttonText: { color: theme.colors.bg, fontWeight: "800", fontSize: 15 },
  linkRow: { flexDirection: "row", justifyContent: "center" },
  linkText: { color: theme.colors.textSub, fontSize: 14 },
  linkBold: { color: theme.colors.primary, fontSize: 14, fontWeight: "700" },
});