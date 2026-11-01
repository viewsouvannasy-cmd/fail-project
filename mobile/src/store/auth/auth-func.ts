import axios from "axios";
import * as SecureStore from "expo-secure-store";

// helper function
import { getEnv } from "@/utils/getEnv";

const isUserLogin = async () => {
  try {
    const clientRefreshToken = await SecureStore.getItemAsync("refreshToken");
    const res = await axios.get(
      `${getEnv("EXPO_PUBLIC_SERVER_HOST")}/api/v1/auth/is-user-login`,
      { headers: { Authorization: `Bearer ${clientRefreshToken}` } },
    );

    return res.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data;
    }
  }
};

export { isUserLogin };
