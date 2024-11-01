import auth from "@/features/auth/authSlice";
import posts from "@/features/posts/postsSlice";
import users from "@/features/users/usersSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: { posts, users, auth },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
