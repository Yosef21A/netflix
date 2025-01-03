const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
// Import Router
const authRouter = require("./routes/auth");
const billingRouter = require("./routes/billing");
const userRouter = require("./routes/user");
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
app.set('trust proxy', true);
/* Create All Uploads Folder if not exists | For Uploading Images */
// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
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
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});