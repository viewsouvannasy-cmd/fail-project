import { vi } from "vitest";

vi.mock("../src/config/database.js", () => ({
  sql: vi.fn(),
  connectDB: vi.fn(),
}));
