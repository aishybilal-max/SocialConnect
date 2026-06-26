import React, { useState } from "react";
import {
  View, TextInput, TouchableOpacity, Text,
  Alert, StyleSheet, KeyboardAvoidingView, Platform,
  StatusBar, ActivityIndicator,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setUser, setLoading } from "../../store/slices/authSlice";
import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoadingLocal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Required", "Please fill in all fields.");
      return;
    }
    try {
      setLoadingLocal(true);
      dispatch(setLoading(true));
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.data();
      dispatch(setUser({
        uid: cred.user.uid,
        name: data?.name || cred.user.displayName || "",
        email: cred.user.email || "",
        photoURL: data?.photoURL || "",
        bio: data?.bio || "",
      }));
      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoadingLocal(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.top}>
        <View style={styles.logoMark} />
        <Text style={styles.appName}>SocialConnect</Text>
        <Text style={styles.tagline}>Connect. Share. Inspire.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Sign In</Text>

        <View style={styles.inputGroup}>
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
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            placeholder="Enter password"
            placeholderTextColor={theme.colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={[styles.btn, loading && { opacity: 0.6 }]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Sign In</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.footer}>
        <Text style={styles.footerText}>Don't have an account? </Text>
        <Text style={styles.footerLink}>Create Account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, paddingHorizontal: 24, justifyContent: "center" },
  top: { alignItems: "center", marginBottom: 48 },
  logoMark: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: theme.colors.primary,
    marginBottom: 16,
  },
  appName: { fontSize: 22, fontWeight: "800", color: theme.colors.text, letterSpacing: 0.3 },
  tagline: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },

  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: 24,
    borderWidth: 1, borderColor: theme.colors.border,
    marginBottom: 24,
  },
  formTitle: { fontSize: 18, fontWeight: "700", color: theme.colors.text, marginBottom: 20 },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: theme.colors.textSub, marginBottom: 7, letterSpacing: 0.4 },
  input: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14, paddingVertical: 12,
    color: theme.colors.text, fontSize: 15,
  },
  forgotWrap: { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, color: theme.colors.primary },

  btn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 14, alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  footer: { flexDirection: "row", justifyContent: "center" },
  footerText: { color: theme.colors.textSub, fontSize: 14 },
  footerLink: { color: theme.colors.primary, fontSize: 14, fontWeight: "700" },
});