import {
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { userLoggedOut } from "../auth/authSlice";

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

const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0,
};

const initialState: Post[] = [
  {
    id: "1",
    title: "First Post!",
    content: "Hello!",
    user: "0",
    date: sub(new Date(), { minutes: 10 }).toISOString(),
    reactions: initialReactions,
  },
  {
    id: "2",
    title: "Second Post",
    content: "More text",
    user: "2",
    date: sub(new Date(), { minutes: 5 }).toISOString(),
    reactions: initialReactions,
  },
];

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
        state.push(action.payload);
      },
    },
    updatePost(state, { payload }: PayloadAction<PostUpdate>) {
      const oldPost = state.find((post) => post.id == payload.id);
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
      const post = state.find((post) => post.id === postId);
      if (post) {
        post.reactions[reaction]++;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(userLoggedOut, (state) => {
      return [];
    });
  },
  selectors: {
    selectAllPosts: (state) => state,
    selectPostById: (state, id) =>
      state.find((post) => post.id == id),
  },
});

export default postsSlice.reducer;
export const { addPost, updatePost, addReaction } =
  postsSlice.actions;
export const { selectAllPosts, selectPostById } =
  postsSlice.selectors;
