// fetchRefreshToken.test.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

import { saveAccessToken, clearAccessToken } from "@/token/accessToken";
import { getEnv } from "@/utils/getEnv";
import { fetchRefreshToken } from "@/store/refresh-token";

jest.mock("axios");

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("@/token/accessToken", () => ({
  saveAccessToken: jest.fn(),
  clearAccessToken: jest.fn(),
}));

jest.mock("@/utils/getEnv", () => ({
  getEnv: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetItem = SecureStore.getItemAsync as jest.Mock;
const mockedGetEnv = getEnv as jest.Mock;

const successResponse = (accessToken = "new-access-token") => ({
  data: { data: { accessToken } },
});

describe("fetchRefreshToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetEnv.mockReturnValue("https://api.example.com");
    mockedGetItem.mockResolvedValue("fake-refresh-token");
  });

  describe("success flow", () => {
    it("should read the refresh token from SecureStore and call the refresh endpoint", async () => {
      mockedAxios.get.mockResolvedValue(successResponse());

      await fetchRefreshToken();

      expect(mockedGetItem).toHaveBeenCalledWith("refreshToken");
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://api.example.com/api/v1/refresh-token",
        { headers: { Authorization: "Bearer fake-refresh-token" } },
      );
    });

    it("should save the new access token and resolve with undefined", async () => {
      mockedAxios.get.mockResolvedValue(successResponse("brand-new-token"));

      await expect(fetchRefreshToken()).resolves.toBeUndefined();

      expect(saveAccessToken).toHaveBeenCalledTimes(1);
      expect(saveAccessToken).toHaveBeenCalledWith("brand-new-token");
      expect(clearAccessToken).not.toHaveBeenCalled();
      expect(router.replace).not.toHaveBeenCalled();
    });
  });

  describe("failure flow", () => {
    it("should clear the token, redirect to signup, and rethrow when the API fails", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Refresh token expired"));

      await expect(fetchRefreshToken()).rejects.toThrow(
        "Refresh token expired",
      );

      expect(clearAccessToken).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith("/(auth)/signup");
      expect(saveAccessToken).not.toHaveBeenCalled();
    });

    it("should clear the token and redirect when SecureStore fails (API not called)", async () => {
      mockedGetItem.mockRejectedValue(new Error("SecureStore error"));

      await expect(fetchRefreshToken()).rejects.toThrow("SecureStore error");

      expect(mockedAxios.get).not.toHaveBeenCalled();
      expect(clearAccessToken).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith("/(auth)/signup");
    });

    it("should throw (via the catch block) when the response shape is invalid", async () => {
      // response.data.data is undefined -> reading accessToken throws TypeError
      mockedAxios.get.mockResolvedValue({ data: {} });

      await expect(fetchRefreshToken()).rejects.toThrow(TypeError);

      expect(saveAccessToken).not.toHaveBeenCalled();
      expect(clearAccessToken).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledWith("/(auth)/signup");
    });

    it("should send 'Bearer null' when there is no refresh token stored", async () => {
      mockedGetItem.mockResolvedValue(null);
      mockedAxios.get.mockResolvedValue(successResponse());

      await fetchRefreshToken();

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        headers: { Authorization: "Bearer null" },
      });
    });
  });

  describe("request deduplication (refreshPromise)", () => {
    it("should make only ONE request when called twice synchronously", async () => {
      mockedAxios.get.mockResolvedValue(successResponse());

      await Promise.all([fetchRefreshToken(), fetchRefreshToken()]);

      expect(mockedGetItem).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(saveAccessToken).toHaveBeenCalledTimes(1);
    });

    it("should share one request among many concurrent callers", async () => {
      mockedAxios.get.mockResolvedValue(successResponse());

      await Promise.all([
        fetchRefreshToken(),
        fetchRefreshToken(),
        fetchRefreshToken(),
        fetchRefreshToken(),
        fetchRefreshToken(),
      ]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(saveAccessToken).toHaveBeenCalledTimes(1);
    });

    it("should return the same in-flight promise to concurrent callers", async () => {
      let resolveRequest!: (value: unknown) => void;
      mockedAxios.get.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      const first = fetchRefreshToken();
      const second = fetchRefreshToken();

      // The function is `async`, so each call returns its own wrapper promise.
      // What matters is that both settle together from ONE underlying request.
      resolveRequest(successResponse("shared-token"));
      await Promise.all([first, second]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(saveAccessToken).toHaveBeenCalledWith("shared-token");
    });

    it("should reject ALL concurrent callers when the shared request fails, but only handle the failure once", async () => {
      let rejectRequest!: (reason: unknown) => void;
      mockedAxios.get.mockReturnValue(
        new Promise((_, reject) => {
          rejectRequest = reject;
        }),
      );

      const first = fetchRefreshToken();
      const second = fetchRefreshToken();
      const third = fetchRefreshToken();

      rejectRequest(new Error("boom"));

      await expect(first).rejects.toThrow("boom");
      await expect(second).rejects.toThrow("boom");
      await expect(third).rejects.toThrow("boom");

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(clearAccessToken).toHaveBeenCalledTimes(1);
      expect(router.replace).toHaveBeenCalledTimes(1);
    });

    it("should NOT start a new request while the first is still pending", async () => {
      let resolveRequest!: (value: unknown) => void;
      mockedAxios.get.mockReturnValue(
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
      );

      const first = fetchRefreshToken();
      await new Promise(process.nextTick); // let the first call progress
      const second = fetchRefreshToken(); // called mid-flight

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      resolveRequest(successResponse());
      await Promise.all([first, second]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it("should reset refreshPromise after success so the next call makes a NEW request", async () => {
      mockedAxios.get.mockResolvedValue(successResponse());

      await fetchRefreshToken();
      await fetchRefreshToken();

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(saveAccessToken).toHaveBeenCalledTimes(2);
    });

    it("should reset refreshPromise after failure so the next call can retry and succeed", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("fail"));
      await expect(fetchRefreshToken()).rejects.toThrow("fail");

      mockedAxios.get.mockResolvedValueOnce(successResponse("recovered-token"));
      await expect(fetchRefreshToken()).resolves.toBeUndefined();

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(saveAccessToken).toHaveBeenCalledWith("recovered-token");
    });

    it("should reset refreshPromise after a SecureStore failure", async () => {
      mockedGetItem.mockRejectedValueOnce(new Error("SecureStore error"));
      await expect(fetchRefreshToken()).rejects.toThrow("SecureStore error");

      mockedGetItem.mockResolvedValueOnce("token");
      mockedAxios.get.mockResolvedValueOnce(successResponse());
      await expect(fetchRefreshToken()).resolves.toBeUndefined();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
});
