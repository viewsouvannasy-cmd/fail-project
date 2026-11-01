import {
  getAccessToken,
  saveAccessToken,
  clearAccessToken,
} from "@/token/accessToken";

describe("accessToken", () => {
  beforeEach(() => {
    clearAccessToken();
  });

  test("have null be default value", () => {
    expect(getAccessToken()).toEqual(null);
  });

  test("save token", () => {
    saveAccessToken("123abc");
    expect(getAccessToken()).toEqual("123abc");
  });

  test("clear token", () => {
    saveAccessToken("123abc");
    clearAccessToken();
    expect(getAccessToken()).toEqual(null);
  });
});
