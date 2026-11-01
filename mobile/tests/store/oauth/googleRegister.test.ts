// googleRegister.test.ts
import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

import { getEnv } from "@/utils/getEnv";
import { saveAccessToken } from "@/token/accessToken";
import { useUserSetProfile } from "@/context/useUserSetProfile";
import { googleRegister } from "@/store/oauth/oauth-func";

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
  isSuccessResponse: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
}));

jest.mock("axios");

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
}));

jest.mock("@/utils/getEnv", () => ({
  getEnv: jest.fn(),
}));

jest.mock("@/token/accessToken", () => ({
  getAccessToken: jest.fn(),
  saveAccessToken: jest.fn(),
}));

jest.mock("@/context/useUserSetProfile", () => ({
  useUserSetProfile: { setState: jest.fn() },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedIsSuccessResponse = isSuccessResponse as unknown as jest.Mock;
const mockedGetEnv = getEnv as jest.Mock;

describe("googleRegister", () => {
  let alertSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    // spy on Alert instead of mocking the whole react-native module
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    mockedGetEnv.mockReturnValue("https://api.example.com");
    mockedAxios.isAxiosError.mockImplementation(
      (e: any): e is any => e?.isAxiosError === true,
    );
  });

  afterEach(() => {
    alertSpy.mockRestore();
    logSpy.mockRestore();
  });

  const mockGoogleSuccess = (idToken: string | null = "fake-id-token") => {
    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: "success",
      data: { idToken },
    });
    mockedIsSuccessResponse.mockReturnValue(true);
  };

  it("should return early when the user cancels Google sign-in", async () => {
    (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ type: "cancelled" });
    mockedIsSuccessResponse.mockReturnValue(false);

    await googleRegister();

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it("should show an alert when no idToken is received", async () => {
    mockGoogleSuccess(null);

    await googleRegister();

    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong try again");
  });

  it("should call the register API with the idToken as Bearer", async () => {
    mockGoogleSuccess("my-id-token");
    mockedAxios.get.mockResolvedValue({
      data: {
        ok: true,
        data: {
          isNewUser: false,
          accessToken: "access",
          refreshToken: "refresh",
        },
      },
    });

    await googleRegister();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/oauth/google/register",
      { headers: { Authorization: "Bearer my-id-token" } },
    );
  });

  it("should handle a NEW user: save tokens, set profile, go to set-profile", async () => {
    mockGoogleSuccess();
    mockedAxios.get.mockResolvedValue({
      data: {
        ok: true,
        data: {
          isNewUser: true,
          accessToken: "new-access",
          refreshToken: "new-refresh",
          user_name: "John Doe",
        },
      },
    });

    await googleRegister();

    expect(saveAccessToken).toHaveBeenCalledWith("new-access");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "refreshToken",
      "new-refresh",
    );
    expect(router.replace).toHaveBeenCalledWith("/(auth)/set-profile");

    // verify the zustand setState updater
    expect(useUserSetProfile.setState).toHaveBeenCalledTimes(1);
    const updater = (useUserSetProfile.setState as jest.Mock).mock.calls[0][0];
    const nextState = updater({ data: { avatar: "avatar-1", bg: "bg-1" } });
    expect(nextState).toEqual({
      data: { name: "John Doe", avatar: "avatar-1", bg: "bg-1" },
    });
  });

  it("should handle an EXISTING user: save tokens and go to tab", async () => {
    mockGoogleSuccess();
    mockedAxios.get.mockResolvedValue({
      data: {
        ok: true,
        data: {
          isNewUser: false,
          accessToken: "old-access",
          refreshToken: "old-refresh",
        },
      },
    });

    await googleRegister();

    expect(saveAccessToken).toHaveBeenCalledWith("old-access");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "refreshToken",
      "old-refresh",
    );
    expect(router.replace).toHaveBeenCalledWith("/(tab)");
    expect(useUserSetProfile.setState).not.toHaveBeenCalled();
  });

  it("should show an alert when the server responds with ok: false", async () => {
    mockGoogleSuccess();
    mockedAxios.get.mockResolvedValue({ data: { ok: false } });

    await googleRegister();

    expect(saveAccessToken).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong try again");
  });

  it("should log the message and alert on an AxiosError", async () => {
    mockGoogleSuccess();
    mockedAxios.get.mockRejectedValue({
      isAxiosError: true,
      message: "Network Error",
    });

    await googleRegister();

    expect(logSpy).toHaveBeenCalledWith("Network Error");
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong try again");
  });

  it("should alert (without logging) on a non-Axios error", async () => {
    (GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(
      new Error("Play services unavailable"),
    );

    await googleRegister();

    expect(logSpy).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith("Something went wrong try again");
  });
});
