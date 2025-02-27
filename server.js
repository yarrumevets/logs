import express from "express";
import { createLog, getLogs } from "./db.js";
import ipinfo from "ipinfo";

// Server Stuff
const app = express();
const SERVER_PORT = process.env.PORT || 4514;

// Middlewre:
app.use(express.json());

// Get ipinfo
app.use(async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  ipinfo(ip, (error, cLoc) => {
    if (error) {
      console.error("LOGS ERROR (ipinfo): ", error);
      return next(); // Fail silently or handle error appropriately
    }
    const locationData = { ...cLoc };
    // Get the location data split out.
    if (locationData.loc) {
      const fullCoords = locationData.loc;
      const [lat, lng] = fullCoords.split(",").map(Number);
      locationData.coords = {
        fullCoords,
        lat,
        lng,
      };
      delete locationData.loc;
    }
    req.locationData = locationData;
    next();
  });
});

app.use((req, res) => {
  const logObject = {
    ...req.locationData,
    host: req.headers.host,
    path: req.headers["x-original-uri"] || req.url,
    method: req.method,
    userAgent: req.headers["user-agent"],
    referer: req.headers.referer,
  };

  console.log("req.body: ", req.body);

  if (req.body) logObject.body = req.body;

  console.log(
    `${logObject.country} , ${logObject.region} , ${logObject.city} , ${logObject.host} , ${logObject.path} `
  );

  createLog(logObject);

  res.sendStatus(200);
});

// Server static files.
app.use(express.static("public"));

// Server
app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
