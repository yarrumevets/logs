import express from "express";
import { createLog } from "./db.js";
import ipinfo from "ipinfo";

const IP_LOCATION_CACHE_TIMEOUT = 30_000;

let maxCachedIps = 0;

// Server Stuff
const app = express();
const SERVER_PORT = process.env.PORT || 4514;

// Middlewre:
app.use(express.json());

const isEmpty = (obj) => Object.keys(obj).length === 0;
// IP cache - this avoids repeated calls to ipinfo:
const ipLocationCache = new Map();
const ipLocationCacheTimeouts = {};
const addIpLocationToCache = (ip, locationData) => {
  ipLocationCache.set(ip, locationData);
  ipLocationCacheTimeouts[ip] = setTimeout(() => {
    ipLocationCache.delete(ip);
    delete ipLocationCacheTimeouts[ip];
  }, IP_LOCATION_CACHE_TIMEOUT);
  console.log("IP Cache Size: ", ipLocationCache.size); // @TODO: remove this after some monitoring.
  maxCachedIps = Math.max(maxCachedIps, ipLocationCache.size);
};

// Get ipinfo
app.use(async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ipLocationCache.has(ip)) {
    req.locationData = ipLocationCache.get(ip);
    return next();
  }
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
    addIpLocationToCache(ip, locationData);
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
  if (!isEmpty(req.body)) logObject.body = req.body;
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
