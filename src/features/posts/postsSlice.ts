import { client } from "@/api/client";
import type { RootState } from "@/app/store";
import { createAppAsyncThunk } from "@/app/withTypes";
import {
  createSlice,
  nanoid,
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
type PostAdd = Pick<Post, "title" | "content" | "user">;

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

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
};

interface PostsState {
  posts: Post[];
  status: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PostsState = {
  posts: [],
  status: "idle",
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: {
      prepare(post: Pick<Post, "title" | "content" | "user">) {
        return {
          payload: {
            id: nanoid(),
            date: new Date().toISOString(),
            reactions: initialReactions,
            ...post,
          },
        };
      },
      reducer(state, action: PayloadAction<Post>) {
        state.posts.push(action.payload);
      },
    },
    updatePost(state, { payload }: PayloadAction<PostUpdate>) {
      const oldPost = state.posts.find(
        (post) => post.id == payload.id,
      );
      if (oldPost) {
        Object.assign(oldPost, payload);
      }
    },
    addReaction(
      state,
      action: PayloadAction<{
        postId: string;
        reaction: ReactionName;
      }>,
    ) {
      const { postId, reaction } = action.payload;
      const post = state.posts.find((post) => post.id === postId);
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
        state.posts = payload;
        state.status = "succeeded";
      })
      .addCase(fetchPosts.rejected, (state, { error }) => {
        state.error = error.message ?? "Unknown Error";
        state.status = "failed";
      })
      .addCase(addPost.fulfilled, (state, { payload }) => {
        state.posts.push(payload);
      });
  },
});

export default postsSlice.reducer;
export const { updatePost, addReaction } = postsSlice.actions;

export const selectAllPosts = (state: RootState) =>
  state.posts.posts;

export const selectPostById = (
  state: RootState,
  postId: string,
) => state.posts.posts.find((post) => post.id === postId);

export const selectPostsByUser = (
  state: RootState,
  userId: string,
) => {
  const allPosts = selectAllPosts(state);
  // ❌ This seems suspicious! See more details below
  return allPosts.filter((post) => post.user === userId);
};

export const selectPostsStatus = (state: RootState) =>
  state.posts.status;
export const selectPostsError = (state: RootState) =>
  state.posts.error;
