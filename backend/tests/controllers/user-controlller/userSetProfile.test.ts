import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

import app from "../../../src/app.js";
import { sql } from "../../../src/config/database.js";

// `sql` is auto-mocked via tests/setup.ts
const mockSql = vi.mocked(sql);

// ── helpers ────────────────────────────────────────────────────────────────────

const ACCESS_SECRET = "test-access-secret"; // matches vitest.config.ts
const USER_ID = 1;

function makeAccessToken(userId = USER_ID) {
  return jwt.sign({ user_id: userId }, ACCESS_SECRET, { expiresIn: "30m" });
}

function makeExpiredToken(userId = USER_ID) {
  return jwt.sign({ user_id: userId }, ACCESS_SECRET, { expiresIn: "0s" });
}

const VALID_BODY = {
  user_name: "TestUser",
  avatar: "https://example.com/avatar.png",
  bg: "https://example.com/bg.png",
};

function makeRequest(token?: string, body = VALID_BODY) {
  const req = request(app).post("/api/v1/user/set-profile").send(body);
  if (token !== undefined) req.set("Authorization", `Bearer ${token}`);
  return req;
}

// ── test suite ─────────────────────────────────────────────────────────────────

describe("POST /api/v1/user/set-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── verifyJwt middleware ───────────────────────────────────────────────────

  describe("verifyJwt middleware", () => {
    it("returns 401 when Authorization header is absent", async () => {
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .send(VALID_BODY);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "no have token provided",
        data: "",
      });
    });

    it("returns 401 when token is missing after 'Bearer '", async () => {
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", "Bearer ")
        .send(VALID_BODY);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
    });

    it("returns 401 when token is the string 'null'", async () => {
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", "Bearer null")
        .send(VALID_BODY);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
    });

    it("returns 401 when token is the string 'undefined'", async () => {
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", "Bearer undefined")
        .send(VALID_BODY);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_MISSING",
        data: "",
      });
    });

    it("returns 401 with TOKEN_INVALID when token is a random string", async () => {
      const res = await makeRequest("not-a-valid-jwt");

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_INVALID",
        data: "",
      });
    });

    it("returns 401 with TOKEN_INVALID when token is signed with wrong secret", async () => {
      const badToken = jwt.sign({ user_id: USER_ID }, "wrong-secret");
      const res = await makeRequest(badToken);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_INVALID",
        data: "",
      });
    });

    it("returns 401 with TOKEN_EXPIRED when token is expired", async () => {
      const expiredToken = makeExpiredToken();
      // small delay to ensure the token is actually expired
      await new Promise((r) => setTimeout(r, 10));

      const res = await makeRequest(expiredToken);

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        ok_verify_token: false,
        msg: "TOKEN_EXPIRED",
        data: "",
      });
    });
  });

  // ── userSetProfile controller ──────────────────────────────────────────────

  describe("userSetProfile controller", () => {
    it("returns 400 when user_name is missing", async () => {
      const token = makeAccessToken();
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ avatar: VALID_BODY.avatar, bg: VALID_BODY.bg });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        msg: "Please provide all require",
        data: "",
      });
    });

    it("returns 400 when avatar is missing", async () => {
      const token = makeAccessToken();
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_name: VALID_BODY.user_name, bg: VALID_BODY.bg });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        msg: "Please provide all require",
        data: "",
      });
    });

    it("returns 400 when bg is missing", async () => {
      const token = makeAccessToken();
      const res = await request(app)
        .post("/api/v1/user/set-profile")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_name: VALID_BODY.user_name, avatar: VALID_BODY.avatar });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        msg: "Please provide all require",
        data: "",
      });
    });

    it("returns 400 when user_name is shorter than 3 characters", async () => {
      const token = makeAccessToken();
      const res = await makeRequest(token, {
        ...VALID_BODY,
        user_name: "ab",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        msg: "Name length should more then 3 character",
        data: "",
      });
    });

    it("returns 400 when user_name is longer than 50 characters", async () => {
      const token = makeAccessToken();
      const res = await makeRequest(token, {
        ...VALID_BODY,
        user_name: "a".repeat(51),
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        ok: false,
        msg: "Name length should less then 50 character",
        data: "",
      });
    });

    it("returns 200 when all fields are valid", async () => {
      mockSql.mockResolvedValueOnce([] as any);

      const token = makeAccessToken();
      const res = await makeRequest(token);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        msg: "Set ptofile success",
        data: "",
      });
    });

    it("returns 200 when user_name is exactly 3 characters (boundary)", async () => {
      mockSql.mockResolvedValueOnce([] as any);

      const token = makeAccessToken();
      const res = await makeRequest(token, { ...VALID_BODY, user_name: "abc" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        msg: "Set ptofile success",
        data: "",
      });
    });

    it("returns 200 when user_name is exactly 50 characters (boundary)", async () => {
      mockSql.mockResolvedValueOnce([] as any);

      const token = makeAccessToken();
      const res = await makeRequest(token, {
        ...VALID_BODY,
        user_name: "a".repeat(50),
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        ok: true,
        msg: "Set ptofile success",
        data: "",
      });
    });
  });
});

