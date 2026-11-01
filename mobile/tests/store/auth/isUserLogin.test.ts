// isUserLogin.test.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { isUserLogin } from "@/store/auth/auth-func";
import { getEnv } from "@/utils/getEnv";

jest.mock("axios");
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));
jest.mock("@/utils/getEnv", () => ({
  getEnv: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockedGetEnv = getEnv as jest.Mock;

describe("isUserLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetEnv.mockReturnValue("https://api.example.com");
    // Make axios.isAxiosError behave the way it should
    mockedAxios.isAxiosError.mockImplementation(
      (e: any): e is any => e?.isAxiosError === true,
    );
  });

  it("should call the API with the refresh token and return res.data on success", async () => {
    const responseData = { success: true, isLogin: true };
    mockedSecureStore.getItemAsync.mockResolvedValue("fake-refresh-token");
    mockedAxios.get.mockResolvedValue({ data: responseData });

    const result = await isUserLogin();

    expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith("refreshToken");
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/is-user-login",
      { headers: { Authorization: "Bearer fake-refresh-token" } },
    );
    expect(result).toEqual(responseData);
  });

  it("should return error.response.data when the server responds with an error (e.g. 401)", async () => {
    const errorData = {
      success: false,
      isLogin: false,
      message: "Unauthorized",
    };
    mockedSecureStore.getItemAsync.mockResolvedValue("expired-token");
    mockedAxios.get.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: errorData },
    });

    const result = await isUserLogin();

    expect(result).toEqual(errorData);
  });

  it("should throw when it's an AxiosError without a response (e.g. network error)", async () => {
    const networkError = { isAxiosError: true, response: undefined };
    mockedSecureStore.getItemAsync.mockResolvedValue("token");
    mockedAxios.get.mockRejectedValue(networkError);

    await expect(isUserLogin()).rejects.toBe(networkError);
  });

  it("should throw when it's a generic non-Axios error", async () => {
    const genericError = new Error("Something went wrong");
    mockedSecureStore.getItemAsync.mockResolvedValue("token");
    mockedAxios.get.mockRejectedValue(genericError);

    await expect(isUserLogin()).rejects.toThrow("Something went wrong");
  });

  it("should throw when reading the token from SecureStore fails", async () => {
    mockedSecureStore.getItemAsync.mockRejectedValue(
      new Error("SecureStore error"),
    );

    await expect(isUserLogin()).rejects.toThrow("SecureStore error");
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it("should send 'Bearer null' when there is no token (a case worth fixing in the code)", async () => {
    mockedSecureStore.getItemAsync.mockResolvedValue(null);
    mockedAxios.get.mockResolvedValue({ data: { isLogin: false } });

    await isUserLogin();

    expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
      headers: { Authorization: "Bearer null" },
    });
  });
});
