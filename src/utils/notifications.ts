// utils/notifications.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";

export async function sendNotification(
  toUserId: string,
  fromUserId: string,
  type: "like" | "comment" | "follow" | "message",
  text: string
) {
  // ✅ Khud ko notification mat bhejo
  if (toUserId === fromUserId) return;

  try {
    await addDoc(collection(db, "users", toUserId, "notifications"), {
      fromUserId,
      type,
      text,
      createdAt: serverTimestamp(),
      read: false,
    });
  } catch (e) {
    console.log("Notification error:", e);
  }
}