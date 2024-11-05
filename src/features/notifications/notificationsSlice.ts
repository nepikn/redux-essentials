import { client } from "@/api/client";
import type { RootState } from "@/app/store";
import { createAppAsyncThunk } from "@/app/withTypes";
import { createSlice } from "@reduxjs/toolkit";

export interface ServerNotification {
  id: string;
  date: string;
  message: string;
  user: string;
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

const initialState: ServerNotification[] = [];

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      fetchNotifications.fulfilled,
      (state, action) => {
        state.push(...action.payload);
        // Sort with newest first
        state.sort((a, b) => b.date.localeCompare(a.date));
      },
    );
  },
});

export default notificationsSlice.reducer;

export const selectAllNotifications = (state: RootState) =>
  state.notifications;
