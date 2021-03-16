import { useSelector } from "react-redux";

import { useStream } from "./hooks/useStream";
import Tweets from "./components/Tweets";

function App() {
  useStream();

  const twitterState = useSelector((state) => state.twitter);

  return (
    <div className="App">
      <Tweets tweets={twitterState.tweets} />
    </div>
  );
}

export default App;
