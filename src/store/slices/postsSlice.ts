// store/slices/postsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Post {
  id: string;
  caption: string;
  mediaUrl: string | null;
  mediaType: string | null;
  userId: string;
  username: string;
  likes: string[];
  createdAt: any;
}

interface PostsState {
  posts: Post[];
  loading: boolean;
}

const initialState: PostsState = { posts: [], loading: false };

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action: PayloadAction<Post[]>) => {
      state.posts = action.payload;
    },
    addPost: (state, action: PayloadAction<Post>) => {
      state.posts.unshift(action.payload);
    },
    removePost: (state, action: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p.id !== action.payload);
    },
    updatePostLikes: (
      state,
      action: PayloadAction<{ postId: string; likes: string[] }>
    ) => {
      const post = state.posts.find((p) => p.id === action.payload.postId);
      if (post) post.likes = action.payload.likes;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setPosts, addPost, removePost, updatePostLikes, setLoading } =
  postsSlice.actions;
export default postsSlice.reducer;