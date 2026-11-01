import {
  GoogleSignin,
  isSuccessResponse,
} from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

// helper function
import { getEnv } from "@/utils/getEnv";
import { getAccessToken, saveAccessToken } from "@/token/accessToken";

// context
import { useUserSetProfile } from "@/context/useUserSetProfile";

import type { Oauth } from "@/types/oauth";

GoogleSignin.configure({
  webClientId: getEnv("EXPO_PUBLIC_GOOGLE_CLIENT_WEB_ID"),
  iosClientId: getEnv("EXPO_PUBLIC_GOOGLE_CLIENT_IOS_ID"),
});

const googleRegsiter = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const resGoogle = await GoogleSignin.signIn();
    if (!isSuccessResponse(resGoogle)) {
      return;
    }

    const idToken = resGoogle.data.idToken;

    if (!idToken) {
      throw new Error("No idToken received");
    }

    const res = (await axios.get(
      `${getEnv("EXPO_PUBLIC_SERVER_HOST")}/api/v1/oauth/google/register`,
      { headers: { Authorization: `Bearer ${idToken}` } },
    )) as Oauth;

    if (!res.data.ok) {
      throw new Error();
    }

    if (res.data.data.isNewUser) {
      saveAccessToken(res.data.data.accessToken);
      console.log(getAccessToken());
      SecureStore.setItemAsync("refreshToken", res.data.data.refreshToken);
      router.replace("/(auth)/set-profile");
      useUserSetProfile.setState((state) => ({
        data: {
          name: res.data.data.user_name,
          avatar: state.data.avatar,
          bg: state.data.bg,
        },
      }));
      return;
    }

    saveAccessToken(res.data.data.accessToken);
    SecureStore.setItemAsync("refreshToken", res.data.data.refreshToken);
    router.replace("/(tab)");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error.message);
    }
    Alert.alert("Something went wrong try again");
  }
};

export { googleRegsiter };
