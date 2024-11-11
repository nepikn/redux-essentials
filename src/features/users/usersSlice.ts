import type { RootState } from "@/app/store";
import {
  createEntityAdapter,
  createSelector,
  type EntityState,
} from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import { selectCurrentUsername } from "../auth/authSlice";

export interface User {
  id: string;
  name: string;
}

const usersAdapter = createEntityAdapter<User>();

const initialState = usersAdapter.getInitialState();

export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<EntityState<User, string>, void>({
      query: () => ({ url: "/users" }),
      transformResponse(res: User[]) {
        return usersAdapter.setAll(initialState, res);
      },
    }),
  }),
});

export const { useGetUsersQuery } = apiSliceWithUsers;

const selectUsersResult =
  apiSliceWithUsers.endpoints.getUsers.select();

const selectUsersData = createSelector(
  selectUsersResult,
  // Fall back to the empty entity state if no response yet.
  (result) => {
    return result.data ?? initialState;
  },
);

export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
} = usersAdapter.getSelectors(selectUsersData);

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state);
  if (currentUsername) {
    return selectUserById(state, currentUsername);
  }
};
