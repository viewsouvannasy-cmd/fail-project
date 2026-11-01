export interface Oauth {
  data: {
    ok: boolean;
    msg: string;
    data: {
      user_name: string;
      isNewUser: boolean;
      refreshToken: string;
      accessToken: string;
    };
  };
}
