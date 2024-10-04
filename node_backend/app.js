require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pino = require("pino");
const mongoose = require("mongoose");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

const chatRoutes = require("./routes/chatRoutes");

const app = express();
const logger = pino();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info("MongoDB Connected"))
  .catch((err) => logger.error("MongoDB Connection Error:", err));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("Welcome to LLM Customizable Chatbot Backend");
});

app.use("/api", chatRoutes);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

const closeDatabase = async () => {
  await mongoose.connection.close();
};

module.exports = { app, closeDatabase };
