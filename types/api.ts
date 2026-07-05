export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "SERVER_ERROR"
  | "UNKNOWN"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR";

export type ApiErrorPayload = {
  code: ApiErrorCode;
  message: string;
  status?: number;
};
