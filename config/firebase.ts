// config/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBMnQ_Y14wdzct03CKZc1YateSI_rgEOdg",
  authDomain: "socialconnect-ab1d1.firebaseapp.com",
  projectId: "socialconnect-ab1d1",
  storageBucket: "socialconnect-ab1d1.appspot.com",
  messagingSenderId: "965362681330",
  appId: "1:965362681330:android:1cf08a04797a32fcad576b",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ AsyncStorage persistence — login session save rehti hai app restart par bhi
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);