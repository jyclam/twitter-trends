const http = require("http");
const WebSocket = require("ws");
const crypto = require("crypto");

const { databaseUrl } = require("../config/index");
const initializeDb = require("./mongoose");

function generateValue(key) {
  return crypto
    .createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11", "binary")
    .digest("base64");
}

function handleUpgrade(req, socket) {
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
}

exports.init = async function () {
  // setup server
  const server = http.createServer();
  console.log("Http server initialized!");

  // handle upgrade to ws connection
  server.on("upgrade", handleUpgrade);

  const wss = new WebSocket.Server({ server, clientTracking: true });
  console.log("Websocket server initialized!");

  wss.on("error", (error) => {
    console.error("Websocket server error: ", error);
  });

  wss.on("connection", (ws, req) => {
    const clientAddress = req.connection.remoteAddress;
    console.log("New connection from: ", clientAddress);

    ws.on("close", () => {
      console.log("Socket closed: ", clientAddress);
    });
    ws.on("error", (error) => {
      console.error(`Websocket with ${clientAddress} error: ${error}`);
    });
  });

  try {
    await initializeDb(databaseUrl);
    console.log("Database initialized!");
  } catch (error) {
    console.error("Error initializing database", error);
  }

  return {
    server,
    wss,
  };
};
