import axios from "axios";
import { saveAccessToken, clearAccessToken } from "@/token/accessToken";
import { getEnv } from "../utils/getEnv";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

let refreshPromise: null | Promise<void> = null;

const fetchRefreshToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const clientRefreshToken = await SecureStore.getItemAsync("refreshToken");

  refreshPromise = axios
    .get(`${getEnv("EXPO_PUBLIC_SERVER_HOST")}/api/v1/refresh-token`, {
      headers: { Authorization: `Bearer ${clientRefreshToken}` },
    })
    .then((response) => {
      saveAccessToken(response.data.data.accessToken);
    })
    .catch((error) => {
      clearAccessToken();
      router.replace("/(auth)/signup");
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export { fetchRefreshToken };
