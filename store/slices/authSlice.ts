// store/slices/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserData {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  bio?: string;
}

interface AuthState {
  user: UserData | null;
  loading: boolean;
}

const initialState: AuthState = { user: null, loading: false };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
    },
    updateUserPhoto: (state, action: PayloadAction<string>) => {
      if (state.user) state.user.photoURL = action.payload;
    },
    updateUserProfile: (
      state,
      action: PayloadAction<{ name?: string; bio?: string; photoURL?: string }>
    ) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearUser: (state) => {
      state.user = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, updateUserPhoto, updateUserProfile } =
  authSlice.actions;
export default authSlice.reducer;