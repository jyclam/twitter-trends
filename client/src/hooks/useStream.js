import { useEffect } from "react";
import { useDispatch } from "react-redux";
import WebSocket from "isomorphic-ws";

import { updateTweets, updateUsers } from "../reducers/twitterSlice";

export const useStream = () => {
  const dispatch = useDispatch((state) => state.twitter);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("connected");
    };

    ws.onclose = () => {
      console.log("disconnected");
    };

    ws.onmessage = (messageEvent) => {
      const message = JSON.parse(messageEvent.data);

      console.log("message received!: ", message);
      if (message.tweets) {
        dispatch(updateTweets(message.tweets));
      }

      if (message.users) {
        dispatch(updateUsers(message.users));
      }
    };

    return () => ws.close();
  }, []);
  // TODO: handle ws error and reconnection
};
