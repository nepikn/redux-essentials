import { addPostsListeners } from "@/features/posts/postsSlice";
import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { AppDispatch, RootState } from "./store";

export const listenerMiddleware = createListenerMiddleware();

export const startAppListening =
  listenerMiddleware.startListening.withTypes<
    RootState,
    AppDispatch
  >();
export type AppStartListening = typeof startAppListening;

addPostsListeners(startAppListening);
