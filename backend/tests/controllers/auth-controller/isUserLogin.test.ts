import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import app from "../../../src/app.js";
import { sql } from "../../../src/config/database.js";

// `sql` is already auto-mocked via tests/setup.ts
const mockSql = vi.mocked(sql);

// ── helpers ────────────────────────────────────────────────────────────────────

const REFRESH_SECRET = "test-refresh-token"; // matches vitest.config.ts
const USER_ID = 42;

function makeRefreshToken(userId = USER_ID) {
  return jwt.sign({ user_id: userId }, REFRESH_SECRET, { expiresIn: "90d" });
}

// ── test suite ─────────────────────────────────────────────────────────────────

describe("GET /api/v1/auth/is-user-login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── 401: missing Authorization header ─────────────────────────────────────
  it("returns 401 when Authorization header is absent", async () => {
    const res = await request(app).get("/api/v1/auth/is-user-login");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "no token provided", data: "" });
  });

  // ── 401: "Bearer " with no token value ────────────────────────────────────
  it("returns 401 when Authorization header contains only 'Bearer '", async () => {
    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", "Bearer ");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "no token provided", data: "" });
  });

  // ── 401: malformed / invalid JWT ──────────────────────────────────────────
  it("returns 401 when the token is invalid", async () => {
    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", "Bearer not-a-valid-jwt");

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "token invalid", data: "" });
  });

  // ── 401: token signed with wrong secret ───────────────────────────────────
  it("returns 401 when the token is signed with a wrong secret", async () => {
    const badToken = jwt.sign({ user_id: USER_ID }, "wrong-secret");

    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", `Bearer ${badToken}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "token invalid", data: "" });
  });

  // ── 401: user not found in DB ─────────────────────────────────────────────
  it("returns 401 when the user is not found in the database", async () => {
    // sql tag-template returns an empty array → no user
    mockSql.mockResolvedValueOnce([] as any);

    const token = makeRefreshToken();
    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "user not found", data: "" });
  });

  // ── 401: refresh token does not match stored hash ─────────────────────────
  it("returns 401 when the refresh token does not match the stored hash", async () => {
    const hashedOtherToken = await bcrypt.hash("some-other-token", 10);

    mockSql.mockResolvedValueOnce([
      { user_id: USER_ID, refresh_token: hashedOtherToken },
    ] as any);

    const token = makeRefreshToken();
    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ ok: false, msg: "invalid", data: "" });
  });

  // ── 200: happy path ───────────────────────────────────────────────────────
  it("returns 200 with a new accessToken when everything is valid", async () => {
    const token = makeRefreshToken();
    const hashedToken = await bcrypt.hash(token, 10);

    mockSql.mockResolvedValueOnce([
      { user_id: USER_ID, refresh_token: hashedToken },
    ] as any);

    const res = await request(app)
      .get("/api/v1/auth/is-user-login")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.msg).toBe("user login");
    expect(res.body.data).toHaveProperty("accessToken");
    expect(typeof res.body.data.accessToken).toBe("string");
  });
});
