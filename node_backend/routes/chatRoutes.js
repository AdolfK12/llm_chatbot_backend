const express = require("express");
const router = express.Router();
const { chatWithLLM } = require("../controllers/chatController");

router.post("/chat", chatWithLLM);

module.exports = router;
