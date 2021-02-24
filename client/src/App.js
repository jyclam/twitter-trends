import { useStream } from "./hooks/useStream";

function App() {
  const { state, dispatch, ACTIONS } = useStream();

  return (
    <div className="App">
      <button onClick={() => dispatch({ type: ACTIONS.SOCKET_CLOSE })}>
        Close
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.TOGGLE_STREAM })}>
        Pause
      </button>
      <div className="display">
        {state.tweets.map((tweet) => (
          <ul key={tweet.timestamp}>
            <li>authorId: {tweet.author_id}</li>
            <li>timestamp: {tweet.created_at}</li>
            <li>tweet: {tweet.text}</li>
          </ul>
        ))}
      </div>
    </div>
  );
}

export default App;
