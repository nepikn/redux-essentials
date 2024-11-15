import { apiSlice } from "@/features/api/apiSlice";
import auth from "@/features/auth/authSlice";
import notifications from "@/features/notifications/notificationsSlice";
import {
  configureStore,
  type ThunkAction,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { listenerMiddleware } from "./listenerMiddleware";

export const store = configureStore({
  reducer: {
    auth,
    notifications,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;
