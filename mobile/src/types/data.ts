export interface ResponseStatus<T = ""> {
  ok: boolean;
  msg: string;
  data: T;
}

interface LoginData {
  accessToken: string;
}

export type ResponseIsLogin = ResponseStatus<LoginData>;
