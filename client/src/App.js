import { useSelector } from "react-redux";
import styled from "styled-components";

import { useStream } from "./hooks/useStream";
import Accordion from "./components/Accordion";

const Main = styled.div`
  display: flex;
  flex-flow: column nowrap;
  width: 100vw;
  height: 100vh;
`;

function App() {
  useStream();

  const twitterState = useSelector((state) => state.twitter);

  return (
    <Main>
      <Accordion tweets={twitterState.tweets} />
    </Main>
  );
}

export default App;
