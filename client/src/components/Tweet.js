import styled from "styled-components";

const Tweet = styled.div`
  // styles pulled from twitter recommended embed fallback css
  // https://developer.twitter.com/en/docs/twitter-for-websites/embedded-tweets/guides/css-for-embedded-tweets
  display: inline-block;
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  border-color: #eee #ddd #bbb;
  border-radius: 5px;
  border-style: solid;
  border-width: 1px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  margin: 10px 5px;
  padding: 0 16px 16px 16px;
  max-width: 468px;

  &:hover {
    background-color: rgb(245, 248, 250);
  }

  p {
    font-size: 16px;
    font-weight: normal;
    line-height: 20px;
  }

  a {
    color: inherit;
    font-weight: normal;
    text-decoration: none;
    outline: 0 none;
  }

  a:hover,
  a:focus {
    text-decoration: underline;
  }
`;

const TweetDiv = ({ toggle, tweet }) => {
  const { author_id: authorId, created_at: createdAt, text: body } = tweet;

  return (
    <Tweet onClick={toggle}>
      <p>{authorId}</p>
      <p>{createdAt}</p>
      <p>{body}</p>
    </Tweet>
  );
};

export default TweetDiv;
