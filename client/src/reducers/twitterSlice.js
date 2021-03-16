import { createSlice } from "@reduxjs/toolkit";

export const twitterSlice = createSlice({
  name: "twitter",
  initialState: {
    tweets: [],
    users: [],
  },
  reducers: {
    updateTweets: (state, action) => ({
      ...state,
      tweets: [...state.tweets, ...action.payload],
    }),
    updateUsers: (state, action) => ({
      ...state,
      users: [...state.users, ...action.payload],
    }),
  },
});

export const { updateTweets, updateUsers } = twitterSlice.actions;

export default twitterSlice.reducer;
