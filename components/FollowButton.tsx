// components/FollowButton.tsx
import React, { useEffect, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { db } from "../config/firebase";
import { followUser, unfollowUser } from "../utils/followService";
import { theme } from "../theme";

type Props = {
  userId: string;
};

export default function FollowButton({ userId }: Props) {
  const myUser = useSelector((state: RootState) => state.auth.user);
  const myId = myUser?.uid;

  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!myId || !userId || myId === userId) return;

    const unsub = onSnapshot(doc(db, "users", myId), (snap) => {
      const data = snap.data();
      const following = Array.isArray(data?.following) ? data.following : [];
      setIsFollowing(following.includes(userId));
    });

    return () => unsub();
  }, [myId, userId]);

  const handlePress = async () => {
    if (!myId || !userId || myId === userId) return;

    try {
      setLoading(true);
      if (isFollowing) {
        await unfollowUser(myId, userId);
      } else {
        await followUser(myId, userId);
      }
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Follow update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!myId || !userId || myId === userId) return null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      style={[
        styles.button,
        isFollowing ? styles.followingButton : styles.followButton,
        loading && styles.disabled,
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isFollowing ? theme.colors.text : theme.colors.bg} />
      ) : (
        <Text style={[styles.buttonText, isFollowing && styles.followingText]}>
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
  },
  followingButton: {
    backgroundColor: theme.colors.surfaceHigh,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  disabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: theme.colors.bg,
    fontSize: theme.font.sm,
    fontWeight: "800",
  },
  followingText: {
    color: theme.colors.text,
  },
});
