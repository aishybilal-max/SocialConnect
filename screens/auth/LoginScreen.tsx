// screens/auth/LoginScreen.tsx
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
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    try {
      setSubmitting(true);
      dispatch(setLoading(true));

      const cred = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.data();

      dispatch(
        setUser({
          uid: cred.user.uid,
          name: data?.name || cred.user.displayName || "",
          email: cred.user.email || "",
          photoURL: data?.photoURL || "",
          bio: data?.bio || "",
        })
      );

      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Login Failed", error?.message || "Could not sign in");
    } finally {
      setSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.bg} />

      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.appName}>SocialConnect</Text>
          <Text style={styles.tagline}>Connect with your people</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.inputWrapper}>
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

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")} style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={submitting}
            style={[styles.button, submitting && styles.disabledBtn]}
          >
            <Text style={styles.buttonText}>{submitting ? "Signing In" : "Sign In"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Signup")} style={styles.linkBtn}>
            <Text style={styles.linkText}>Create a new account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  logoArea: {
    alignItems: "center",
    marginBottom: 28,
  },
  appName: {
    color: theme.colors.text,
    fontSize: theme.font.xxl,
    fontWeight: "900",
  },
  tagline: {
    color: theme.colors.textSub,
    marginTop: 8,
    fontSize: theme.font.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: theme.font.xl,
    fontWeight: "900",
    marginBottom: 18,
  },
  inputWrapper: {
    marginBottom: 14,
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
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: theme.colors.primary,
    fontSize: theme.font.sm,
    fontWeight: "700",
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
  linkBtn: {
    alignItems: "center",
    marginTop: 16,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: "700",
    fontSize: theme.font.sm,
  },
});
