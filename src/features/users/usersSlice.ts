import type { RootState } from "@/app/store";
import { createSelector } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { selectCurrentUsername } from "../auth/authSlice";

export interface User {
  id: string;
  name: string;
}

// const usersAdapter = createEntityAdapter<User>();

// const initialState = usersAdapter.getInitialState();

export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => ({ url: "/users" }),
    }),
  }),
});

export const { useGetUsersQuery } = apiSliceWithUsers;

const emptyUsers: User[] = [];

export const selectUsersResult =
  apiSliceWithUsers.endpoints.getUsers.select();

// export const {
//   selectAll: selectAllUsers,
//   selectById: selectUserById,
// } = usersAdapter.getSelectors((state: RootState) => state.users);

export const selectAllUsers = createSelector(
  selectUsersResult,
  (result) => result?.data ?? emptyUsers,
);

export const selectUserById = createSelector(
  selectAllUsers,
  (state: RootState, userId: string) => userId,
  (users, userId) => users.find((user) => user.id == userId),
);

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state);
  if (currentUsername) {
    return selectUserById(state, currentUsername);
  }
};
