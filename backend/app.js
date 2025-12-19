require("dotenv").config(); 

const express = require("express");
const app = express();
const mongoose = require("mongoose");

const register = require("./routes/register.route");
const login = require("./routes/userLogin.router");
const jobRoutes = require("./routes/job.router");
const bidRoutes = require("./routes/bid.router");
const messageRouter = require("./routes/message.router");
const taskRouter = require("./routes/task.router");
const ratingRouter = require("./routes/ratings.route");

app.use((err, req, res, next) => {
  console.error(" Error:", err.message);
  res.status(err.status || 500).send({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.error("Connection error:", err));

if (!process.env.JWT_PRIVATE_KEY) {
  console.error("FATAL ERROR: JWT private key is not defined");
  process.exit(1);
}

app.use(express.json());
app.use("/api/register", register);
app.use("/api/login", login);
app.use("/api/jobs", jobRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/messages", messageRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/ratings", ratingRouter);

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
