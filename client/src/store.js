import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import twitterReducer from "./reducers/twitterSlice";
import binanceReducer from "./reducers/binanceSlice";

export default configureStore({
  reducer: { twitter: twitterReducer, binance: binanceReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== "production",
});
