import { forceGenerateNotifications } from "@/api/server";
import type { AppThunk, RootState } from "@/app/store";
import {
  createAction,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";

export interface ServerNotification {
  id: string;
  date: string;
  message: string;
  user: string;
}

export interface NotificationMetadata {
  id: string;
  read: boolean;
  isNew: boolean;
}

const notificationsReceived = createAction<ServerNotification[]>(
  "notifications/notificationsReceived",
);

export const apiSliceWithNotifications = apiSlice.injectEndpoints(
  {
    endpoints: (builder) => ({
      getNotifications: builder.query<ServerNotification[], void>(
        {
          query: () => "/notifications",
          async onCacheEntryAdded(arg, lifecycleApi) {
            const ws = new WebSocket("ws://localhost");
            try {
              await lifecycleApi.cacheDataLoaded;

              ws.addEventListener("message", (e) => {
                const { type, payload } = JSON.parse(e.data);

                switch (type) {
                  case "notifications": {
                    lifecycleApi.updateCachedData((notifs) => {
                      notifs.push(...payload);
                      notifs.sort((a, b) =>
                        b.date.localeCompare(a.date),
                      );
                    });

                    lifecycleApi.dispatch(
                      notificationsReceived(payload),
                    );

                    break;
                  }
                  default:
                    break;
                }
              });
            } catch {
              // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
              // in which case `cacheDataLoaded` will throw
            }

            await lifecycleApi.cacheEntryRemoved;

            ws.close();
          },
        },
      ),
    }),
  },
);

export const { useGetNotificationsQuery } =
  apiSliceWithNotifications;

export const fetchNotificationsWebsocket =
  (): AppThunk => (dispatch, getState) => {
    const [latestNotif] = selectNotificationsData(getState());
    const latestTimestamp = latestNotif?.date ?? "";

    forceGenerateNotifications(latestTimestamp);
  };

const emptyNotifications: ServerNotification[] = [];

export const selectNotificationsResult =
  apiSliceWithNotifications.endpoints.getNotifications.select();

const selectNotificationsData = createSelector(
  selectNotificationsResult,
  (notificationsResult) =>
    notificationsResult.data ?? emptyNotifications,
);

const metadataAdapter =
  createEntityAdapter<NotificationMetadata>();

const initialState = metadataAdapter.getInitialState();

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    readNotifications(state) {
      Object.values(state.entities).forEach((metadata) => {
        metadata.read = true;
      });
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      isAnyOf(
        notificationsReceived,
        apiSliceWithNotifications.endpoints.getNotifications
          .matchFulfilled,
      ),
      (state, action) => {
        const notificationsMetadata: NotificationMetadata[] =
          action.payload.map(({ id }) => ({
            id,
            read: false,
            isNew: true,
          }));

        Object.values(state.entities).forEach((metadata) => {
          // Any notifications we've read are no longer new
          metadata.isNew = !metadata.read;
        });

        metadataAdapter.addMany(state, notificationsMetadata);
      },
    );
  },
});

export const { readNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;

export const {
  selectAll: selectAllNotificationsMetadata,
  selectEntities: selectMetadataEntities,
} = metadataAdapter.getSelectors(
  (state: RootState) => state.notifications,
);

export const selectUnreadNotificationsCount = (
  state: RootState,
) => {
  const allMetadata = selectAllNotificationsMetadata(state);
  const unreadNotifications = allMetadata.filter(
    (metadata) => !metadata.read,
  );
  return unreadNotifications.length;
};
