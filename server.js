import express from "express";
import { createLog, getLogs } from "./db.js";

// Server Stuff
const app = express();
const SERVER_PORT = process.env.PORT || 4514;

// Server static files.
app.use(express.static("public"));

app.use(express.json());

app.use((req, res) => {
  console.log({
    ip:
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"] ||
      req.socket.remoteAddress,
    host: req.headers.host,
    path: req.headers["x-original-uri"] || req.url,
    method: req.method,
    headers: req.headers,
  });
  res.sendStatus(200);
});

// Server
app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
