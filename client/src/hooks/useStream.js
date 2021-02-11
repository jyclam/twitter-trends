import { useReducer, useEffect } from "react";
const WebSocket = require("isomorphic-ws");

const ACTIONS = {
  UPDATE_TWEETS_STATE: "UPDATE_TWEETS_STATE",
  UPDATE_USERS_STATE: "UPDATE_USERS_STATE",
  ERROR: "ERROR",
  SOCKET_OPENED: "SOCKET_OPENED",
  SOCKET_CLOSE: "SOCKET_CLOSE",
  SEND_MESSAGE: "SEND_MESSAGE",
};

const initialState = {
  tweets: [],
  users: [],
  socket: null,
  streamMeta: { error: null, paused: false },
};

const reducer = (state, action) => {
  console.log("logging state and action: ");
  console.log({ state, action });
  if (action.type === ACTIONS.ERROR) {
    return {
      ...state,
      streamMeta: { ...state.streamMeta, error: action.payload.error },
    };
  }
  if (action.type === ACTIONS.UPDATE_TWEETS_STATE) {
    return {
      ...state,
      tweets: [...state.tweets, ...action.payload],
    };
  }
  if (action.type === ACTIONS.UPDATE_USERS_STATE) {
    return {
      ...state,
      users: [...state.users, ...action.payload],
    };
  }
  if (action.type === ACTIONS.SOCKET_OPENED) {
    return {
      ...state,
      socket: action.payload,
    };
  }
  if (action.type === ACTIONS.SOCKET_CLOSE) {
    state.socket.close();
    return {
      ...state,
      socket: null,
    };
  }
  if (action.type === ACTIONS.SEND_MESSAGE) {
    state.socket.send(action.payload);
    return {
      ...state,
    };
  }
  throw new Error("Unhandled action in useStream reducer");
};

export const useStream = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("connected");
      dispatch({
        type: ACTIONS.SOCKET_OPENED,
        payload: ws,
      });
    };

    ws.onclose = () => {
      console.log("disconnected");
    };

    ws.onmessage = (messageEvent) => {
      const message = JSON.parse(messageEvent.data);

      console.log("message received!: ", message);
      if (message.tweets) {
        dispatch({
          type: ACTIONS.UPDATE_TWEETS_STATE,
          payload: message.tweets,
        });
      }

      if (message.users) {
        dispatch({
          type: ACTIONS.UPDATE_USERS_STATE,
          payload: message.users,
        });
      }
    };

    return () => ws.close();
  }, []);

  return {
    state,
    dispatch,
    ACTIONS,
  };
};
