export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "UNKNOWN";

export type ApiErrorPayload = {
  code: ApiErrorCode;
  message: string;
  status?: number;
};
