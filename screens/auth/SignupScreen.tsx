import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { auth, db } from "../../config/firebase";
import { theme } from "../../theme";

export default function SignupScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🔥 CREATE USER DOCUMENT (IMPORTANT FIX INCLUDED)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        photoURL: "",
        bio: "",

        // ✅ IMPORTANT FIX (FOLLOW SYSTEM)
        followers: [],
        following: [],

        createdAt: new Date(),
      });

      Alert.alert("Success", "Account created successfully");

      navigation.replace("Main");
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Full Name"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={theme.colors.textMuted}
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleSignup}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: theme.colors.text,
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: theme.colors.text,
  },

  button: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "800",
  },

  loginText: {
    color: theme.colors.textMuted,
    textAlign: "center",
    marginTop: 20,
  },
});