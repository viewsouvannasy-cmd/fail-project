import { it, expect, vi } from "vitest";
import { sql } from "../../src/config/database.js";

it("sql have to be mock function", () => {
  expect(vi.isMockFunction(sql)).toBe(true);
});
