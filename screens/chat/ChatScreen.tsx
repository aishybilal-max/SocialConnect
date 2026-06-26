// screens/chat/ChatScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { db, auth } from "../../config/firebase";
import { theme } from "../../theme";

export default function ChatScreen({ route, navigation }: any) {
  const chatId = route?.params?.chatId;
  const username = route?.params?.username || "Chat";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const myId = auth.currentUser?.uid;

  useEffect(() => {
    navigation?.setOptions?.({
      title: username,
      headerShown: true,
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: {
        color: theme.colors.text,
        fontWeight: "700",
      },
      headerShadowVisible: false,
    });
  }, [username, navigation]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 120);
    });

    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId || !myId) return;

    const text = message.trim();
    setMessage("");

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: myId,
      createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);

    if (snap.exists()) {
      await updateDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(chatRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        participants: [myId],
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.surface} />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMine = item.senderId === myId;

          return (
            <View style={[styles.bubbleWrap, isMine ? styles.wrapMine : styles.wrapTheirs]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, isMine ? styles.textMine : styles.textTheirs]}>
                  {item.text}
                </Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputBar}>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          multiline
        />

        <TouchableOpacity
          onPress={sendMessage}
          disabled={!message.trim()}
          style={[styles.sendBtn, !message.trim() && { opacity: 0.45 }]}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  messageList: {
    padding: 14,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginVertical: 5,
    flexDirection: "row",
  },
  wrapMine: {
    justifyContent: "flex-end",
  },
  wrapTheirs: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 5,
  },
  bubbleTheirs: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 5,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textMine: {
    color: theme.colors.bg,
  },
  textTheirs: {
    color: theme.colors.text,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    maxHeight: 90,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: theme.colors.text,
    fontSize: 14,
  },
  sendBtn: {
    minWidth: 62,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  sendText: {
    color: theme.colors.bg,
    fontWeight: "800",
    fontSize: 13,
  },
});