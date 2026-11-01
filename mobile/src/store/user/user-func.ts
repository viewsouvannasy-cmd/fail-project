// library
import axios from "axios";

// helper function
import { getEnv } from "@/utils/getEnv";
import { getAccessToken } from "@/token/accessToken";
import { handleAccessTokenError } from "@/utils/handleError";

// types
import type { ResponseStatus } from "@/types/data";

const userSetProfile = async (
  isRetry = false,
  { user_name, avatar, bg }: { user_name: string; avatar: string; bg: string },
): Promise<ResponseStatus> => {
  try {
    const accessToken = getAccessToken();
    const res = await axios.post(
      `${getEnv("EXPO_PUBLIC_SERVER_HOST")}/api/v1/user/set-profile`,
      { user_name, avatar, bg },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return res.data;
  } catch (error) {
    return await handleAccessTokenError(error, isRetry, () =>
      userSetProfile(true, { user_name, avatar, bg }),
    );
  }
};

export { userSetProfile };
