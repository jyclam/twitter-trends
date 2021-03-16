import { configureStore } from "@reduxjs/toolkit";
import twitterReducer from "./reducers/twitterSlice";

export default configureStore({
  reducer: { twitter: twitterReducer },
});
