import auth from "@/features/auth/authSlice";
import notifications from "@/features/notifications/notificationsSlice";
import posts from "@/features/posts/postsSlice";
import users from "@/features/users/usersSlice";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: { posts, users, auth, notifications },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
