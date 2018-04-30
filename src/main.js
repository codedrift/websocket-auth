import express from "express";
import http from "http";

import bodyParser from "body-parser";
import websocket from "./websocket";

const app = express();
const server = http.Server(app);


websocket(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://app.local.clinq.com:3000");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

server.listen(3001, () => {
  // logger.info({ "NODE_ENV": process.env });
  console.log(`Server listening on port 3001!`);
});
