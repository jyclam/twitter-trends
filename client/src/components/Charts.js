import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";

import { fetchKlineData } from "../reducers/binanceSlice";

const Chart = styled.div`
  height: 30em;
`;

const Charts = ({ tweet }) => {
  const dispatch = useDispatch((state) => state.twitter);
  const [{ timestamp, interval, symbol }, setGraphSettings] = useState({
    timestamp: new Date(tweet.created_at).valueOf(),
    interval: "5m",
    symbol: "DOGEUSDT",
  });

  useSelector(
    (state) => state.binance.data[`${timestamp}${interval}${symbol}`],
  );

  useEffect(() => {
    dispatch(
      fetchKlineData({
        timestamp,
        interval,
        symbol,
      }),
    );
  }, []);

  return (
    <>
      <Chart>{new Date(tweet.created_at).valueOf()}</Chart>
    </>
  );
};

export default Charts;
