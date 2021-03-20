import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export const fetchKlineData = createAsyncThunk(
  "binance/klineData",
  async ({ timestamp, interval = "5m", symbol = "DOGEUSDT" }, thunkApi) => {
    const startTime = dayjs(timestamp).subtract(1, "hour").valueOf();
    const endTime = dayjs(timestamp).add(24, "hour").valueOf();

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`,
    );
    const data = await response.json();
    return data;
  },
  {
    condition: ({ timestamp, interval, symbol }, { getState }) => {
      const { binance } = getState();
      // skip if this request is already in state
      if (binance.data[`${timestamp}${interval}${symbol}`]) return false;
      // TODO: check for pending request too
    },
  },
);

const binanceSlice = createSlice({
  name: "binance",
  initialState: {
    data: {},
  },
  reducers: {},
  extraReducers: {
    [fetchKlineData.fulfilled]: (state, action) => {
      const {
        meta: {
          arg: { timestamp, interval, symbol },
        },
      } = action;

      state.data = {
        ...state.data,
        [`${timestamp}${interval}${symbol}`]: action.payload,
      };
    },
    [fetchKlineData.rejected]: (state, action) => {
      state.error = action.error;
    },
  },
});

export const { addData } = binanceSlice.actions;

export default binanceSlice.reducer;
