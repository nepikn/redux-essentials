# Redux Essentials Example

隨 [Redux Essentials] 完成的社群平台

[Redux Essentials]: https://redux.js.org/tutorials/essentials/part-1-overview-concepts

## 預期功能

用戶登入後可以

- 瀏覽貼文
- 瀏覽個別用戶發布的貼文
- 新增貼文
- 修改貼文
- 對貼文表示「👍」等等
- 瀏覽通知
- 手動更新通知

## 展示

[部署於 codesandbox.io]()

| 首頁    | 貼文    | 通知      |
| ------- | ------- | --------- |
| ![root] | ![post] | ![notifs] |

[root]: https://github.com/nepikn/redux-essentials/blob/main/screenshots/root.jpeg
[post]: https://github.com/nepikn/redux-essentials/blob/main/screenshots/post.jpeg
[notifs]: https://github.com/nepikn/redux-essentials/blob/main/screenshots/notifs.jpeg

## 主要技術

- `react` v18
- `@reduxjs/toolkit` v2
- `react-router-dom` v6
- `typescript` v5

## 指令

```bash
# 安裝
npm install
# 開發
npm dev
# 打包
npm build
```

## 學習內容

- [Redux 學習歷程](https://hackmd.io/Kic_y5eZQZeM_9MjPJublw?view#reduxjstoolkit-v2)
- optimistic update

```javascript
// src/features/api/apiSlice.ts
export const apiSlice = createApi({
  endpoints: (builder) => ({
    addReaction: builder.mutation({
      query: ({ postId, reaction }) => ({
        // ...
      }),
      async onQueryStarted({ postId, reaction }, api) {
        const getPostPatchResult = api.dispatch(
          apiSlice.util.updateQueryData(
            "getPost",
            postId,
            (draft) => {
              // ...
            },
          ),
        );

        try {
          await api.queryFulfilled;
        } catch {
          getPostPatchResult.undo();
        }
      },
    }),
  }),
});
```

- WebSocket connection management

```javascript
// src/features/notifications/notificationsSlice.ts
apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifs: builder.query({
      query: () => "/notifs",
      async onCacheEntryAdded(arg, api) {
        const ws = new WebSocket("ws://localhost");
        try {
          await api.cacheDataLoaded;

          ws.addEventListener("message", (e) => {
            const { type, payload } = JSON.parse(e.data);

            switch (type) {
              case "notifs": {
                api.updateCachedData((notifs) => {
                  // ...
                });

                break;
              }
            }
          });
        } catch {}

        await api.cacheEntryRemoved;

        ws.close();
      },
    }),
  }),
});
```

## 展望

- 學習 WebSocket
