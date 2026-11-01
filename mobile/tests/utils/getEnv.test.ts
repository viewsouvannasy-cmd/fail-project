import { getEnv } from "@/utils/getEnv";

describe("getEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return the value when the env variable is set", () => {
    process.env.EXPO_PUBLIC_SERVER_HOST = "https://api.example.com";

    expect(getEnv("EXPO_PUBLIC_SERVER_HOST")).toBe("https://api.example.com");
  });

  it("should throw when the env variable is not set", () => {
    delete process.env.EXPO_PUBLIC_SERVER_HOST;

    expect(() => getEnv("EXPO_PUBLIC_SERVER_HOST")).toThrow(
      "EXPO_PUBLIC_SERVER_HOST is not set",
    );
  });

  it("should throw when the env variable is an empty string", () => {
    process.env.EXPO_PUBLIC_SERVER_HOST = "";

    expect(() => getEnv("EXPO_PUBLIC_SERVER_HOST")).toThrow(
      "EXPO_PUBLIC_SERVER_HOST is not set",
    );
  });

  it("should include the variable name in the error message", () => {
    expect(() => getEnv("SOME_MISSING_VAR")).toThrow("SOME_MISSING_VAR");
  });

  it("should throw an Error instance", () => {
    expect(() => getEnv("SOME_MISSING_VAR")).toThrow(Error);
  });

  it("should return the exact string without trimming or modifying it", () => {
    process.env.MY_VAR = "  value with spaces  ";

    expect(getEnv("MY_VAR")).toBe("  value with spaces  ");
  });

  it("should treat the string '0' and 'false' as valid values (they are truthy strings)", () => {
    process.env.FLAG_ZERO = "0";
    process.env.FLAG_FALSE = "false";

    expect(getEnv("FLAG_ZERO")).toBe("0");
    expect(getEnv("FLAG_FALSE")).toBe("false");
  });
});
