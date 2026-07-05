import type { ApiErrorCode, ApiErrorPayload } from "@/types/api";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = payload.status;
  }

  static notFound(message = "المورد غير موجود.") {
    return new ApiError({ code: "NOT_FOUND", message, status: 404 });
  }

  static network(message = "تعذر الاتصال بالخادم. تحقق من الشبكة.") {
    return new ApiError({ code: "NETWORK_ERROR", message });
  }

  static server(message = "حدث خطأ في الخادم. حاول مرة أخرى.", status = 500) {
    return new ApiError({ code: "SERVER_ERROR", message, status });
  }

  static fromResponse(status: number, message?: string) {
    if (status === 404) {
      return ApiError.notFound(message);
    }

    if (status >= 500) {
      return ApiError.server(message, status);
    }

    return new ApiError({
      code: "UNKNOWN",
      message: message ?? `فشل الطلب برمز ${status}`,
      status,
    });
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown, fallback = "حدث خطأ غير متوقع.") {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
