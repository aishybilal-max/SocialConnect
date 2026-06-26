import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import { doc, onSnapshot } from "firebase/firestore";
import { useSelector } from "react-redux";
import { db } from "../config/firebase";
import { followUser, unfollowUser } from "../utils/followService";

export default function FollowButton({ userId }: any) {
  const myUser = useSelector((state: any) => state.auth.user);
  const myId = myUser?.uid;

  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (!myId) return;

    const unsub = onSnapshot(doc(db, "users", myId), (snap) => {
      const data = snap.data();
      setIsFollowing(data?.following?.includes(userId));
    });

    return () => unsub();
  }, [myId, userId]);

  const toggle = async () => {
    if (isFollowing) {
      await unfollowUser(myId, userId);
    } else {
      await followUser(myId, userId);
    }
  };

  if (myId === userId) return null;

  return (
    <TouchableOpacity onPress={toggle}>
      <Text style={{ color: "white" }}>
        {isFollowing ? "Following" : "Follow"}
      </Text>
    </TouchableOpacity>
  );
}