import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";

import { userSetProfile } from "./user-func";

import type { AxiosError } from "axios";
import type { ResponseStatus } from "@/types/data";

export const useSetProfile = () => {
  return useMutation<
    ResponseStatus,
    AxiosError<void>,
    { user_name: string; avatar: string; bg: string }
  >({
    mutationFn: (variable) => userSetProfile(false, variable),
    onSuccess: () => {
      router.push("/(tab)");
    },
  });
};
