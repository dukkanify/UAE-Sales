export type ApiErrorCode =
  | "NETWORK_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR"
  | "UNKNOWN";

export type ApiErrorPayload = {
  code: ApiErrorCode;
  message: string;
  status?: number;
};

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorPayload };

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};
