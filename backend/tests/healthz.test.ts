import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("GET /health", () => {
  it("return ok", async () => {
    const res = await request(app).get("/health");
    expect(res.text).toBe("ok");
  });

  it("return 200", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });
});
