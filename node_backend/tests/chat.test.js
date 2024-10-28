const request = require("supertest");
const { app, closeDatabase } = require("../app");
const { getFromCache, setInCache } = require("../utils/cache");
const axios = require("axios");

jest.mock("../utils/cache");
afterAll(async () => {
  await closeDatabase();
});

describe("POST /api/chat", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const test = process.env.GITHUB_ACTIONS ? it.skip : it;

  test("should return a reply from LLM when a valid message is provided (cache miss)", async () => {
    getFromCache.mockResolvedValue(null);

    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("reply");
    expect(getFromCache).toHaveBeenCalledTimes(1);
    expect(setInCache).toHaveBeenCalledTimes(1);
  });

  it("should return a cached reply if the message was previously requested (cache hit)", async () => {
    getFromCache.mockResolvedValue("Cached response");

    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(response.statusCode).toBe(200);
    expect(response.body.reply).toBe("Cached response");
    expect(getFromCache).toHaveBeenCalledTimes(1);
    expect(setInCache).not.toHaveBeenCalled();
  });

  it("should return a 400 error when no message is provided", async () => {
    const response = await request(app).post("/api/chat").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Message is required");
  });

  it("should handle error from Hugging Face API", async () => {
    getFromCache.mockResolvedValue(null);

    jest
      .spyOn(axios, "post")
      .mockRejectedValueOnce(new Error("Error from API"));

    const response = await request(app)
      .post("/api/chat")
      .send({ message: "API Test" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty(
      "error",
      "Error communicating with LLM"
    );

    axios.post.mockRestore();
  });
});
