import axios from "axios";
import { fetchRefreshToken } from "@/store/refresh-token";
import { router } from "expo-router";

export const handleAccessTokenError = async <T>(
  error: unknown,
  isRetry: boolean,
  retry: () => Promise<T>,
): Promise<T> => {
  if (axios.isAxiosError(error) && error.response) {
    console.log(error.response.data);
    if (error.response.status === 401 && !error.response.data.ok_verify_token) {
      const msg = error.response.data.msg;

      if (
        "TOKEN_EXPIRED".includes(msg) ||
        "TOKEN_MISSING".includes(msg) ||
        !isRetry
      ) {
        await fetchRefreshToken();
        return await retry();
      }

      if ("TOKEN_INVALID".includes(msg)) {
        router.replace("/(auth)/signup");
        throw error;
      }
    }
  }

  router.replace("/(auth)/signup");
  throw error;
};
