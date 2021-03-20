import { useState } from "react";
import styled from "styled-components";

import Tweet from "./Tweet.js";
import Charts from "./Charts.js";

const Panel = styled.div`
  border: dotted thin red;
`;

const AccordionPanel = ({ tweet }) => {
  const [isVisible, setVisible] = useState(false);

  return (
    <Panel>
      <Tweet toggle={() => setVisible(!isVisible)} tweet={tweet} />
      {isVisible ? <Charts tweet={tweet} /> : null}
    </Panel>
  );
};

export default AccordionPanel;
