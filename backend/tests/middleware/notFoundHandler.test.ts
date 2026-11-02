import { describe, it, expect } from "vitest";

import request from "supertest";

import app from "../../src/app";

describe("notFoundHandler", () => {
  it("retunr url path name , with msg not found", async () => {
    const res = await request(app).get("/fjjjjfjfjf");

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
      ok: false,
      msg: `this url /fjjjjfjfjf is not found`,
      data: "",
    });
  });
});
