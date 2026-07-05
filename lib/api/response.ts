import type { ApiErrorCode } from "@/types";

export class ApiHttpError extends Error {
  status: number;
  code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function jsonSuccess<T>(data: T, init?: ResponseInit) {
  return Response.json(data, { status: 200, ...init });
}

export function jsonCreated<T>(data: T) {
  return Response.json(data, { status: 201 });
}

export function jsonError(error: ApiHttpError) {
  return Response.json(
    {
      code: error.code,
      message: error.message,
    },
    { status: error.status },
  );
}

export async function handleApiRoute(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiHttpError) {
      return jsonError(error);
    }

    console.error("[api]", error);
    return jsonError(
      new ApiHttpError(500, "SERVER_ERROR", "حدث خطأ غير متوقع. حاول مرة أخرى."),
    );
  }
}
