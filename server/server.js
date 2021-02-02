const http = require("http");
const WebSocket = require("ws");

const PORT = 5000;

const server = http.createServer();

const wss = new WebSocket.Server({ server });

const fakeMessage = () => ({
  author_id: Math.round(Math.random() * 10000000),
  timestamp: new Date(),
  tweet: "something",
});

wss.on("connection", function connection(ws) {
  setInterval(() => {
    ws.send(JSON.stringify(fakeMessage()));
  }, 500);

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);

    // echo message
    ws.send("received: " + message);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
