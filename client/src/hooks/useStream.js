import { useReducer, useEffect } from "react";
const WebSocket = require("isomorphic-ws");

const ACTIONS = {
  UPDATE_STATE: "UPDATE_STATE",
  ERROR: "ERROR",
  SOCKET_OPENED: "SOCKET_OPENED",
  SOCKET_CLOSE: "SOCKET_CLOSE",
  SEND_MESSAGE: "SEND_MESSAGE",
  TOGGLE_STREAM: "TOGGLE_STREAM",
};

const initialState = {
  tweets: [],
  socket: null,
  streamMeta: { error: null, paused: false },
};

const reducer = (state, action) => {
  if (action.type === ACTIONS.ERROR) {
    return {
      ...state,
      streamMeta: { ...state.streamMeta, error: action.payload.error },
    };
  }
  if (action.type === ACTIONS.UPDATE_STATE) {
    return {
      ...state,
      tweets: [...state.tweets, action.payload],
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
  if (action.type === ACTIONS.TOGGLE_STREAM) {
    if (state.streamMeta.paused) {
      state.socket.send(JSON.stringify({ cmd: "resume" }));
    } else {
      state.socket.send(JSON.stringify({ cmd: "pause" }));
    }

    return {
      ...state,
      streamMeta: { paused: !state.streamMeta.paused },
    };
  }
  console.log({ state, action });
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

    ws.onmessage = (data) => {
      console.log(data.data);

      dispatch({
        type: ACTIONS.UPDATE_STATE,
        payload: JSON.parse(data.data),
      });
    };

    return () => ws.close();
  }, []);

  return {
    state,
    dispatch,
    ACTIONS,
  };
};
