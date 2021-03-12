import { useStream } from "./hooks/useStream";
import Tweets from "./components/Tweets";

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
      <Tweets tweets={state.tweets} />
    </div>
  );
}

export default App;
