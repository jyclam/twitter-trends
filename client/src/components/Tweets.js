import Tweet from "./Tweet.js";
import styled from "styled-components";

const TweetsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
`;

const Tweets = ({ tweets }) => (
  <TweetsContainer>
    {tweets.map(({ created_at, author_id, text, id }) => (
      <Tweet key={id} createdAt={created_at} authorId={author_id} body={text} />
    ))}
  </TweetsContainer>
);

export default Tweets;
