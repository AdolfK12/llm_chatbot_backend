const axios = require("axios");

const retryRequest = async (url, data, headers, retries = 3, delay = 10000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, data, { headers });
      return response;
    } catch (error) {
      console.error(`Retry ${i + 1} failed:`, error.message);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("All retries failed");
};

exports.chatWithLLM = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const response = await retryRequest(
      "https://api-inference.huggingface.co/models/tiiuae/falcon-7b",
      { inputs: message },
      {
        Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
      }
    );

    if (
      response.data &&
      Array.isArray(response.data) &&
      response.data.length > 0
    ) {
      const generatedText = response.data[0]?.generated_text;
      return res.status(200).json({ reply: generatedText });
    }

    res.status(200).json({ reply: "Unable to generate response" });
  } catch (error) {
    console.error("Error communicating with Hugging Face API:", error.message);
    res.status(500).json({ error: "Error communicating with LLM" });
  }
};
