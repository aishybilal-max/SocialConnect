// screens/chat/ChatScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View, TextInput, TouchableOpacity, Text, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, StatusBar,
} from "react-native";
import {
  collection, addDoc, onSnapshot, orderBy, query,
  doc, updateDoc, serverTimestamp, getDoc, setDoc,
} from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { db, auth } from "../../config/firebase";
import { sendNotification } from "../../utils/notifications";
import { theme } from "../../theme";

export default function ChatScreen({ route, navigation }: any) {
  const chatId   = route?.params?.chatId;
  const userId   = route?.params?.userId;   // other user
  const username = route?.params?.username || "Chat";

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const myUser = useSelector((state: RootState) => state.auth.user);
  const myId = myUser?.uid;

  useEffect(() => {
    navigation?.setOptions?.({ title: username });
  }, [username]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!message.trim() || !chatId || !myId) return;
    const text = message.trim();
    setMessage("");

    await addDoc(collection(db, "chats", chatId, "messages"), {
      text, senderId: myId, createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, "chats", chatId);
    const snap = await getDoc(chatRef);
    if (snap.exists()) {
      await updateDoc(chatRef, { lastMessage: text, updatedAt: serverTimestamp() });
    } else {
      await setDoc(chatRef, {
        lastMessage: text, updatedAt: serverTimestamp(), participants: [myId, userId],
      });
    }

    // ✅ Message notification — sirf doosre user ko
    if (userId && userId !== myId) {
      await sendNotification(
        userId, myId,
        "message",
        `${myUser?.name || "Someone"} sent you a message`
      );
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
                <Text style={[styles.bubbleText, { color: isMine ? "#fff" : theme.colors.text }]}>
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
          placeholder="Type a message..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          blurOnSubmit={false}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendBtn}>
          <Text style={styles.sendIcon}>›</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  messageList: { padding: 12, gap: 4 },
  bubbleWrap: { marginVertical: 2 },
  wrapMine: { alignItems: "flex-end" },
  wrapTheirs: { alignItems: "flex-start" },
  bubble: {
    maxWidth: "75%", paddingHorizontal: 14,
    paddingVertical: 10, borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1, borderColor: theme.colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  inputBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    padding: 10,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1, borderTopColor: theme.colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16, paddingVertical: 10,
    color: theme.colors.text, fontSize: 14,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: theme.colors.primary,
    justifyContent: "center", alignItems: "center",
  },
  sendIcon: { color: "#fff", fontSize: 24, fontWeight: "800" },
});