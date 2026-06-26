// App.tsx
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, AppDispatch } from "./store";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./config/firebase";
import { setUser, clearUser, setLoading } from "./store/slices/authSlice";
import AppNavigator from "./navigation/AppNavigator";

function AuthListener() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(setLoading(true));
    // ✅ App open hote hi check karo — agar pehle login tha toh seedha Main mein jao
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          const data = snap.data();
          dispatch(setUser({
            uid: firebaseUser.uid,
            name: data?.name || firebaseUser.displayName || "",
            email: firebaseUser.email || "",
            photoURL: data?.photoURL || "",
            bio: data?.bio || "",
          }));
        } catch {
          dispatch(clearUser());
        }
      } else {
        dispatch(clearUser());
      }
      dispatch(setLoading(false));
    });
    return () => unsub();
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <AuthListener />
    </Provider>
  );
}