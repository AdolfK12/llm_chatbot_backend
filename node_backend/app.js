require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pino = require("pino");
const mongoose = require("mongoose");

const chatRoutes = require("./routes/chatRoutes");

const app = express();
const logger = pino();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error("MongoDB Connection Error:", err));

app.get("/", (req, res) => {
  res.send("Welcome to LLM Customizable Chatbot Backend");
});

app.use("/api", chatRoutes);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
