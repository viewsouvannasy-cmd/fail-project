import { googleRegister } from "./oauth-func";

import { useMutation } from "@tanstack/react-query";

export function useGoogleRegister() {
  return useMutation({
    mutationFn: googleRegister,
  });
}
