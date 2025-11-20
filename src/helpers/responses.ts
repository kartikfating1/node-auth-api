interface BaseResponse<T> {
  status: boolean;
  data: T | ErrorData;
}

interface ErrorData {
  errorCode: number;
  message: string;
}

interface SuccessResponse<T> extends BaseResponse<T> {
  status: true;
  data: T;
}

export interface ErrorResponse extends BaseResponse<ErrorData> {
  status: false;
  data: ErrorData;
}

type Response<T> = SuccessResponse<T> | ErrorResponse;

export function createResponse<T>(data: T): SuccessResponse<T>;
export function createResponse(
  errorCode: number,
  message: string
): ErrorResponse;
export function createResponse<T>(
  dataOrErrorCode: T | number,
  message?: string
): Response<T> {
  if (typeof dataOrErrorCode === "number" && message) {
    return {
      status: false,
      data: {
        errorCode: dataOrErrorCode,
        message: message,
      },
    } as ErrorResponse;
  } else {
    return {
      status: true,
      data: dataOrErrorCode as T,
    } as SuccessResponse<T>;
  }
}
