import { client } from "@/api/client";
import type { RootState } from "@/app/store";
import { createAppAsyncThunk } from "@/app/withTypes";
import {
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";

export interface ServerNotification {
  id: string;
  date: string;
  message: string;
  user: string;
}

export interface ClientNotification extends ServerNotification {
  read: boolean;
  isNew: boolean;
}

export const fetchNotifications = createAppAsyncThunk(
  "notifications/fetchNotifications",
  async (_, thunkApi) => {
    const allNotifications = selectAllNotifications(
      thunkApi.getState(),
    );
    const [latestNotification] = allNotifications;
    const latestTimestamp = latestNotification
      ? latestNotification.date
      : "";
    const response = await client.get<ServerNotification[]>(
      `/fakeApi/notifications?since=${latestTimestamp}`,
    );
    return response.data;
  },
);

const notificationsAdapter =
  createEntityAdapter<ClientNotification>({
    sortComparer: (a, b) => b.date.localeCompare(a.date),
  });

const initialState = notificationsAdapter.getInitialState();

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    readNotifications(state) {
      Object.values(state.entities).forEach((notification) => {
        notification.read = true;
      });
    },
  },
  extraReducers(builder) {
    builder.addCase(
      fetchNotifications.fulfilled,
      (state, action) => {
        const notificationsWithMetadata: ClientNotification[] =
          action.payload.map((notification) => ({
            ...notification,
            read: false,
            isNew: true,
          }));

        Object.values(state.entities).forEach((notification) => {
          // Any notifications we've read are no longer new
          notification.isNew = !notification.read;
        });

        notificationsAdapter.addMany(
          state,
          notificationsWithMetadata,
        );
      },
    );
  },
});

export const { readNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;

export const { selectAll: selectAllNotifications } =
  notificationsAdapter.getSelectors(
    (state: RootState) => state.notifications,
  );

export const selectUnreadNotificationsCount = (
  state: RootState,
) => {
  const allNotifications = selectAllNotifications(state);
  const unreadNotifications = allNotifications.filter(
    (notification) => !notification.read,
  );
  return unreadNotifications.length;
};
