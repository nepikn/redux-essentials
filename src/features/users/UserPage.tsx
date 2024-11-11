import { Link, useParams } from "react-router-dom";

import { useAppSelector } from "@/app/hooks";

import { createSelector } from "@reduxjs/toolkit";
import type { TypedUseQueryStateResult } from "@reduxjs/toolkit/query/react";
import { useGetPostsQuery, type Post } from "../api/apiSlice";
import { selectUserById } from "./usersSlice";

// Create a TS type that represents "the result value passed
// into the `selectFromResult` function for this hook"
type GetPostSelectFromResultArg = TypedUseQueryStateResult<
  Post[],
  any,
  any
>;

const selectPostsForUser = createSelector(
  (result: GetPostSelectFromResultArg) => result.data,
  (result: GetPostSelectFromResultArg, userId: string) => userId,
  (data, userId) =>
    data?.filter((post) => post.user == userId) ?? [],
);

export const UserPage = () => {
  const { userId } = useParams();

  const user = useAppSelector((state) =>
    selectUserById(state, userId!),
  );

  const { postsForUser } = useGetPostsQuery(undefined, {
    selectFromResult(result) {
      return {
        ...result,
        postsForUser: selectPostsForUser(result, userId!),
      };
    },
  });

  if (!user) {
    return (
      <section>
        <h2>User not found!</h2>
      </section>
    );
  }

  const postTitles = postsForUser.map((post) => (
    <li key={post.id}>
      <Link to={`/posts/${post.id}`}>{post.title}</Link>
    </li>
  ));

  return (
    <section>
      <h2>{user.name}</h2>

      <ul>{postTitles}</ul>
    </section>
  );
};
