const axios = require("axios");
const { getFromCache, setInCache } = require("../utils/cache");

exports.chatWithLLM = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const cacheKey = `chat:${message}`;

  try {
    const cachedReply = await getFromCache(cacheKey);
    if (cachedReply) {
      console.log("Cache hit for message:", message);
      return res.status(200).json({ reply: cachedReply });
    }

    console.log("Cache miss for message:", message);

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/gpt2",
      {
        inputs: message,
        parameters: { max_length: 50 },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
        },
      }
    );

    if (
      !response.data ||
      !response.data[0] ||
      !response.data[0].generated_text
    ) {
      console.error("Invalid response from Hugging Face API:", response.data);
      return res
        .status(500)
        .json({ error: "Error generating response from LLM" });
    }

    let reply = response.data[0].generated_text;
    reply = reply.split("\n")[0];

    reply = reply.substring(0, 100);

    await setInCache(cacheKey, reply);

    console.log("Response cached for message:", message);

    res.status(200).json({ reply });
  } catch (error) {
    console.error(
      "Error communicating with Hugging Face API:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "Error communicating with LLM" });
  }
};
