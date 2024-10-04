const request = require("supertest");
const { app, closeDatabase } = require("../app");

afterAll(async () => {
  await closeDatabase();
});

describe("POST /api/chat", () => {
  it("should return a reply from LLM when a valid message is provided", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ message: "Hello" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("reply");
  });

  it("should return a 400 error when no message is provided", async () => {
    const response = await request(app).post("/api/chat").send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("error", "Message is required");
  });
});
