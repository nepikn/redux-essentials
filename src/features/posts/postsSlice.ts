import { client } from "@/api/client";
import type { AppStartListening } from "@/app/listenerMiddleware";
import type { RootState } from "@/app/store";
import { createAppAsyncThunk } from "@/app/withTypes";
import {
  createEntityAdapter,
  createSelector,
  createSlice,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { logout } from "../auth/authSlice";

export interface Reactions {
  thumbsUp: number;
  tada: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export type ReactionName = keyof Reactions;

export interface Post {
  id: string;
  title: string;
  content: string;
  user: string;
  date: string;
  reactions: Reactions;
}

type PostUpdate = Pick<Post, "id" | "title" | "content">;
export type PostAdd = Pick<Post, "title" | "content" | "user">;

export const fetchPosts = createAppAsyncThunk(
  "posts/fetch",
  async () => {
    const res = await client.get<Post[]>("fakeApi/posts");
    return res.data;
  },
  {
    condition(_, { getState }) {
      const status = (getState() as RootState).posts.status;
      return status == "idle";
    },
  },
);

export const addPost = createAppAsyncThunk(
  "posts/add",
  async (post: PostAdd) => {
    const res = await client.post<Post>("fakeApi/posts", post);
    return res.data;
  },
);

export const addPostsListeners = (
  startAppListening: AppStartListening,
) => {
  startAppListening({
    actionCreator: addPost.fulfilled,
    effect: async (action, listenerApi) => {
      const { toast } = await import("react-tiny-toast");

      const toastId = toast.show("New post added!", {
        variant: "success",
        position: "bottom-right",
        pause: true,
      });

      await listenerApi.delay(5000);

      toast.remove(toastId);
    },
  });
};

interface PostsState extends EntityState<Post, Post["id"]> {
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const postsAdapter = createEntityAdapter<Post>({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState: PostsState = postsAdapter.getInitialState({
  status: "idle",
  error: null,
});

const postsSlice = createSlice({
  name: "posts",
  initialState,
  selectors: { ...postsAdapter.getSelectors() },
  reducers: {
    updatePost(
      state,
      { payload: { id, ...changes } }: PayloadAction<PostUpdate>,
    ) {
      postsAdapter.updateOne(state, { id, changes });
    },
    addReaction(
      state,
      action: PayloadAction<{
        postId: string;
        reaction: ReactionName;
      }>,
    ) {
      const { postId, reaction } = action.payload;
      const post = state.entities[postId];
      if (post) {
        post.reactions[reaction]++;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(logout.fulfilled, (state) => initialState)
      .addCase(fetchPosts.pending, (state, { payload }) => {
        state.status = "pending";
      })
      .addCase(fetchPosts.fulfilled, (state, { payload }) => {
        postsAdapter.setAll(state, payload);

        state.status = "succeeded";
      })
      .addCase(fetchPosts.rejected, (state, { error }) => {
        state.error = error.message ?? "Unknown Error";
        state.status = "failed";
      })
      .addCase(addPost.fulfilled, postsAdapter.addOne);
  },
});

export default postsSlice.reducer;
export const { updatePost, addReaction } = postsSlice.actions;

export const {
  selectIds: selectPostIds,
  selectAll: selectAllPosts,
  selectById: selectPostById,
} = postsAdapter.getSelectors((state: RootState) => state.posts);

export const selectPostsByUser = createSelector(
  [selectAllPosts, (state: RootState, userId: string) => userId],
  (posts, userId) => posts.filter((post) => post.user === userId),
);

export const selectPostsStatus = (state: RootState) =>
  state.posts.status;
export const selectPostsError = (state: RootState) =>
  state.posts.error;
