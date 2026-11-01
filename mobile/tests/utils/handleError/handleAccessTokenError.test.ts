import axios from "axios";
import { router } from "expo-router";
import { fetchRefreshToken } from "@/store/refresh-token";
import { handleAccessTokenError } from "@/utils/handleError";

jest.mock("axios", () => ({
  __esModule: true,
  default: { isAxiosError: jest.fn() },
}));

jest.mock("@/store/refresh-token", () => ({
  fetchRefreshToken: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

const mockIsAxiosError = axios.isAxiosError as unknown as jest.Mock;
const mockFetchRefreshToken = fetchRefreshToken as jest.Mock;
const mockReplace = router.replace as jest.Mock;

const makeAxiosError = (
  status: number,
  data: Record<string, unknown> = {},
) => ({
  isAxiosError: true,
  response: { status, data },
});

describe("handleAccessTokenError", () => {
  let retry: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    retry = jest.fn().mockResolvedValue("retry-result");
    mockFetchRefreshToken.mockResolvedValue(undefined);
    mockIsAxiosError.mockImplementation((e: any) => !!e?.isAxiosError);
  });

  describe("TOKEN_EXPIRED / TOKEN_MISSING on first attempt", () => {
    it.each(["TOKEN_EXPIRED", "TOKEN_MISSING"])(
      "refreshes the token and retries when msg is %s",
      async (msg) => {
        const error = makeAxiosError(401, { msg });

        const result = await handleAccessTokenError(error, false, retry);

        expect(mockFetchRefreshToken).toHaveBeenCalledTimes(1);
        expect(retry).toHaveBeenCalledTimes(1);
        expect(result).toBe("retry-result");
        expect(mockReplace).not.toHaveBeenCalled();
      },
    );

    it("refreshes the token before calling retry", async () => {
      const error = makeAxiosError(401, { msg: "TOKEN_EXPIRED" });

      await handleAccessTokenError(error, false, retry);

      const refreshOrder = mockFetchRefreshToken.mock.invocationCallOrder[0];
      const retryOrder = retry.mock.invocationCallOrder[0];
      expect(refreshOrder).toBeLessThan(retryOrder);
    });

    it("propagates the error if retry itself fails", async () => {
      const retryError = new Error("retry failed");
      retry.mockRejectedValue(retryError);
      const error = makeAxiosError(401, { msg: "TOKEN_EXPIRED" });

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        retryError,
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("propagates the error if refreshing the token fails", async () => {
      const refreshError = new Error("refresh failed");
      mockFetchRefreshToken.mockRejectedValue(refreshError);
      const error = makeAxiosError(401, { msg: "TOKEN_MISSING" });

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        refreshError,
      );
      expect(retry).not.toHaveBeenCalled();
    });
  });

  describe("TOKEN_EXPIRED / TOKEN_MISSING when already retried", () => {
    it.each(["TOKEN_EXPIRED", "TOKEN_MISSING"])(
      "redirects to signup and rethrows when msg is %s",
      async (msg) => {
        const error = makeAxiosError(401, { msg });

        await expect(handleAccessTokenError(error, true, retry)).rejects.toBe(
          error,
        );

        expect(mockFetchRefreshToken).not.toHaveBeenCalled();
        expect(retry).not.toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
      },
    );
  });

  describe("TOKEN_INVALID", () => {
    it.each([false, true])(
      "redirects to signup once and rethrows (isRetry=%s)",
      async (isRetry) => {
        const error = makeAxiosError(401, { msg: "TOKEN_INVALID" });

        await expect(
          handleAccessTokenError(error, isRetry, retry),
        ).rejects.toBe(error);

        expect(mockFetchRefreshToken).not.toHaveBeenCalled();
        expect(retry).not.toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
      },
    );
  });

  describe("fallthrough cases", () => {
    it("redirects and rethrows for an unknown 401 msg", async () => {
      const error = makeAxiosError(401, { msg: "SOMETHING_ELSE" });

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        error,
      );

      expect(mockFetchRefreshToken).not.toHaveBeenCalled();
      expect(retry).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
    });

    it("redirects and rethrows when ok_verify_token is truthy", async () => {
      const error = makeAxiosError(401, {
        msg: "TOKEN_EXPIRED",
        ok_verify_token: true,
      });

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        error,
      );

      expect(mockFetchRefreshToken).not.toHaveBeenCalled();
      expect(retry).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
    });

    it.each([400, 403, 404, 500])(
      "redirects and rethrows for non-401 status %s",
      async (status) => {
        const error = makeAxiosError(status, { msg: "TOKEN_EXPIRED" });

        await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
          error,
        );

        expect(mockFetchRefreshToken).not.toHaveBeenCalled();
        expect(retry).not.toHaveBeenCalled();
        expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
      },
    );

    it("redirects and rethrows for an axios error without a response", async () => {
      const error = { isAxiosError: true, response: undefined };

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        error,
      );

      expect(retry).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
    });

    it("redirects and rethrows for a non-axios error", async () => {
      const error = new Error("network down");

      await expect(handleAccessTokenError(error, false, retry)).rejects.toBe(
        error,
      );

      expect(mockFetchRefreshToken).not.toHaveBeenCalled();
      expect(retry).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/signup");
    });
  });
});
