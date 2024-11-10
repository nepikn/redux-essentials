// Import the RTK Query methods from the React-specific entry point
import {
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

// Use the `Post` type we've already defined in `postsSlice`,
// and then re-export it for ease of use
import type {
  Post,
  PostAdd,
  PostUpdate,
} from "@/features/posts/postsSlice";
export type { Post };

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: "api",
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({ baseUrl: "/fakeApi" }),
  // The "endpoints" represent operations and requests for this server
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    // The `getPosts` endpoint is a "query" operation that returns data.
    // The return value is a `Post[]` array, and it takes no arguments.
    getPosts: builder.query<Post[], void>({
      // The URL for the request is '/fakeApi/posts'
      query: () => "/posts",
      providesTags: (result = [], error, arg, meta) => [
        "Post",
        ...result.map(
          ({ id }) => ({ type: "Post", id }) as const,
        ),
      ],
      // default
      keepUnusedDataFor: 60,
    }),
    getPost: builder.query<Post, string>({
      query: (arg) => `/posts/${arg}`,
      providesTags: (result, error, arg) => [
        { type: "Post", id: arg },
      ],
    }),
    addNewPost: builder.mutation<Post, PostAdd>({
      query: (initialPost) => ({
        url: "/posts",
        method: "POST",
        body: initialPost,
      }),
      invalidatesTags: ["Post"],
    }),
    editPost: builder.mutation<Post, PostUpdate>({
      query: (post) => ({
        url: `/posts/${post.id}`,
        method: "PATCH",
        body: post,
      }),
      invalidatesTags(result, error, arg, meta) {
        return [{ type: "Post", id: arg.id }];
      },
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  useEditPostMutation,
} = apiSlice;
