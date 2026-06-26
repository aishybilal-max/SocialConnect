// utils/notifications.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function sendNotification(
  toUserId: string,
  fromUserId: string,
  type: "like" | "comment" | "follow",
  text: string
) {
  try {
    await addDoc(collection(db, "users", toUserId, "notifications"), {
      fromUserId,
      type,
      text,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.log("Notification error:", e);
  }
}