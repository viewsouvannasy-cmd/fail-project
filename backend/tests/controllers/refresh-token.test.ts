import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import app from "../../src/app.js";
import { sql } from "../../src/config/database.js";

// `sql` is auto-mocked via tests/setup.ts
const mockSql = vi.mocked(sql);

// ── helpers ────────────────────────────────────────────────────────────────────

const REFRESH_SECRET = "test-refresh-token"; // matches vitest.config.ts
const USER_ID = 7;

function makeRefreshToken(userId = USER_ID) {
  return jwt.sign({ user_id: userId }, REFRESH_SECRET, { expiresIn: "90d" });
}

function makeRequest(authHeader?: string) {
  const req = request(app).get("/api/v1/refresh-token");
  if (authHeader !== undefined) req.set("Authorization", authHeader);
  return req;
}

// ── test suite ─────────────────────────────────────────────────────────────────

describe("GET /api/v1/refresh-token", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── middleware: checkHeaderAuth ────────────────────────────────────────────

  describe("checkHeaderAuth middleware", () => {
    it("returns 401 when Authorization header is absent", async () => {
      const res = await makeRequest();

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "no have token in auth header",
        data: "",
      });
    });

    it("returns 401 when Authorization header contains only 'Bearer '", async () => {
      const res = await makeRequest("Bearer ");

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "no token provided",
        data: "",
      });
    });
  });

  // ── controller: refreshToken ───────────────────────────────────────────────

  describe("refreshToken controller", () => {
    it("returns 500 when the token is an invalid JWT", async () => {
      const res = await makeRequest("Bearer not-a-valid-jwt");

      expect(res.statusCode).toBe(500);
    });

    it("returns 500 when the token is signed with a wrong secret", async () => {
      const badToken = jwt.sign({ user_id: USER_ID }, "wrong-secret");
      const res = await makeRequest(`Bearer ${badToken}`);

      expect(res.statusCode).toBe(500);
    });

    it("returns 401 when the user is not found in the database", async () => {
      mockSql.mockResolvedValueOnce([] as any);

      const token = makeRefreshToken();
      const res = await makeRequest(`Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        msg: "user is not found",
        data: "",
      });
    });

    it("returns 401 when the refresh token does not match the stored hash", async () => {
      const hashedOtherToken = await bcrypt.hash("some-other-token", 10);

      mockSql.mockResolvedValueOnce([
        { user_id: USER_ID, refresh_token: hashedOtherToken },
      ] as any);

      const token = makeRefreshToken();
      const res = await makeRequest(`Bearer ${token}`);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok: false,
        msg: "invalid token",
        data: "",
      });
    });

    it("returns 200 with a new accessToken when everything is valid", async () => {
      const token = makeRefreshToken();
      const hashedToken = await bcrypt.hash(token, 10);

      mockSql.mockResolvedValueOnce([
        { user_id: USER_ID, refresh_token: hashedToken },
      ] as any);

      const res = await makeRequest(`Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.msg).toBe("got new access token success");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(typeof res.body.data.accessToken).toBe("string");
    });
  });
});
