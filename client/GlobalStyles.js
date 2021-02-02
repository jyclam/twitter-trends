import { createGlobalStyle } from "styled-components";

const globalStyles = createGlobalStyle`
* {
  box-sizing: border-box;
}

html, body{
  height: 100%;
}

  html {
  font-size: 62.5%;
}

body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: white;
}
`;

export default globalStyles;
