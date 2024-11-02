import { client } from "@/api/client";
import type { RootState } from "@/app/store";
import { createAppAsyncThunk } from "@/app/withTypes";
import { createSlice } from "@reduxjs/toolkit";
import { selectCurrentUsername } from "../auth/authSlice";

interface User {
  id: string;
  name: string;
}

export const fetchUsers = createAppAsyncThunk(
  "users/fetchUsers",
  async () => {
    const response = await client.get<User[]>("/fakeApi/users");
    return response.data;
  },
);

const initialState: User[] = [];

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(
      fetchUsers.fulfilled,
      (state, { payload }) => payload,
    );
  },
});

export default usersSlice.reducer;

export const selectAllUsers = (state: RootState) => state.users;

export const selectUserById = (
  state: RootState,
  userId: string | null,
) => state.users.find((user) => user.id === userId);

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state);
  return selectUserById(state, currentUsername);
};
