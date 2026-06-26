import { doc, setDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const followUser = async (me: string, target: string) => {
  if (!me || !target || me === target) return;

  await setDoc(doc(db, "users", me), {
    following: arrayUnion(target),
  }, { merge: true });

  await setDoc(doc(db, "users", target), {
    followers: arrayUnion(me),
  }, { merge: true });
};

export const unfollowUser = async (me: string, target: string) => {
  await setDoc(doc(db, "users", me), {
    following: arrayRemove(target),
  }, { merge: true });

  await setDoc(doc(db, "users", target), {
    followers: arrayRemove(me),
  }, { merge: true });
};