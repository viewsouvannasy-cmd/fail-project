import axios from "axios";

import { getEnv } from "@/utils/getEnv";
import { getAccessToken } from "@/token/accessToken";
import { handleAccessTokenError } from "@/utils/handleError";
import { userSetProfile } from "@/store/user/user-func";

jest.mock("axios");

jest.mock("@/utils/getEnv", () => ({
  getEnv: jest.fn(),
}));

jest.mock("@/token/accessToken", () => ({
  getAccessToken: jest.fn(),
}));

jest.mock("@/utils/handleError", () => ({
  handleAccessTokenError: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGetEnv = getEnv as jest.Mock;
const mockedGetAccessToken = getAccessToken as jest.Mock;
const mockedHandleError = handleAccessTokenError as jest.Mock;

const profile = {
  user_name: "John Doe",
  avatar: "avatar-1",
  bg: "bg-1",
};

describe("userSetProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetEnv.mockReturnValue("https://api.example.com");
    mockedGetAccessToken.mockReturnValue("fake-access-token");
  });

  it("should POST the profile with the access token and return res.data on success", async () => {
    const responseData = { ok: true, message: "Profile updated" };
    mockedAxios.post.mockResolvedValue({ data: responseData });

    const result = await userSetProfile(false, profile);

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/user/set-profile",
      { user_name: "John Doe", avatar: "avatar-1", bg: "bg-1" },
      { headers: { Authorization: "Bearer fake-access-token" } },
    );
    expect(result).toEqual(responseData);
    expect(mockedHandleError).not.toHaveBeenCalled();
  });

  it("should delegate to handleAccessTokenError when the request fails", async () => {
    const error = { isAxiosError: true, response: { status: 401 } };
    const handledResult = { ok: false, message: "handled" };
    mockedAxios.post.mockRejectedValue(error);
    mockedHandleError.mockResolvedValue(handledResult);

    const result = await userSetProfile(false, profile);

    expect(mockedHandleError).toHaveBeenCalledTimes(1);
    expect(mockedHandleError).toHaveBeenCalledWith(
      error,
      false,
      expect.any(Function),
    );
    expect(result).toEqual(handledResult);
  });

  it("should pass isRetry = true through to handleAccessTokenError", async () => {
    const error = new Error("fail");
    mockedAxios.post.mockRejectedValue(error);
    mockedHandleError.mockResolvedValue({ ok: false });

    await userSetProfile(true, profile);

    expect(mockedHandleError).toHaveBeenCalledWith(
      error,
      true,
      expect.any(Function),
    );
  });

  it("should give handleAccessTokenError a retry callback that calls userSetProfile again with isRetry = true", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("401"));

    // simulate handleAccessTokenError: after "refreshing", call the retry callback
    mockedHandleError.mockImplementation(
      async (_error: unknown, _isRetry: boolean, retry: () => Promise<any>) =>
        retry(),
    );

    // the retry (second) request succeeds
    const retryResponse = { ok: true, message: "ok after retry" };
    mockedAxios.post.mockResolvedValueOnce({ data: retryResponse });

    const result = await userSetProfile(false, profile);

    expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    expect(mockedHandleError).toHaveBeenCalledTimes(1);
    expect(result).toEqual(retryResponse);
  });

  it("should use the retry callback with the same profile data", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("401"));
    mockedHandleError.mockImplementation(
      async (_e: unknown, _r: boolean, retry: () => Promise<any>) => retry(),
    );
    mockedAxios.post.mockResolvedValueOnce({ data: { ok: true } });

    await userSetProfile(false, profile);

    // second call = the retry; body must be identical
    expect(mockedAxios.post).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/v1/user/set-profile",
      { user_name: "John Doe", avatar: "avatar-1", bg: "bg-1" },
      expect.any(Object),
    );
  });

  it("should send 'Bearer undefined' when there is no access token (worth guarding in code)", async () => {
    mockedGetAccessToken.mockReturnValue(undefined);
    mockedAxios.post.mockResolvedValue({ data: { ok: true } });

    await userSetProfile(false, profile);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      { headers: { Authorization: "Bearer undefined" } },
    );
  });

  it("should propagate the error if handleAccessTokenError itself throws", async () => {
    mockedAxios.post.mockRejectedValue(new Error("fail"));
    mockedHandleError.mockRejectedValue(new Error("refresh failed"));

    await expect(userSetProfile(false, profile)).rejects.toThrow(
      "refresh failed",
    );
  });
});
