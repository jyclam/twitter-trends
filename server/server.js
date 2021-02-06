const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");

const PORT = 5000;

const server = http.createServer();

function generateValue(key) {
  return crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
    .digest("base64");
}

server.on("upgrade", (req, socket) => {
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }

  const acceptKey = req.headers["sec-websocket-key"];
  const acceptHash = generateValue(acceptKey);

  const resHeaders = [
    "HTTP/1.1 101 Web Socket Protocol Handshake",
    "Connection: Upgrade",
    "Upgrade: websocket",
    `Sec-WebSocket-Accept: ${acceptHash}`,
  ];

  socket.write(resHeaders.join());
});

const wss = new WebSocket.Server({ server, clientTracking: true });

let clientCounter = 0;

wss.on("connection", function (ws, req) {
  let fakeInterval;

  ws.id = `client${clientCounter}`;
  clientCounter++;

  fakeInterval = streamFakeMessages(ws);

  ws.on("message", function incoming(message) {
    const msg = JSON.parse(message);

    if (msg.cmd === "pause") {
      // console.log("pausing interval: ", fakeInterval);
      clearInterval(fakeInterval);
    }
    if (msg.cmd === "resume") {
      fakeInterval = streamFakeMessages(ws);
      // console.log("new interval:: ", fakeInterval);
    }

    console.log("received: ", message);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

const fakeMessage = () => ({
  author_id: Math.round(Math.random() * 10000000),
  timestamp: new Date(),
  tweet: "something",
});

const streamFakeMessages = (ws) => {
  return setInterval(() => {
    const msg = fakeMessage();
    ws.send(JSON.stringify(msg));
  }, 500);
};
