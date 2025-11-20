export interface BaseResponse {
    status: boolean;
    data: unknown;
}
  
export interface SuccessResponse<T> extends BaseResponse {
    status: true;
    data: T;
}
  
export interface ErrorResponse extends BaseResponse {
    status: false;
    data: {
      errorCode: number;
      message: string;
    };
}
  
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
    return {
      status: true,
      data: data,
    };
}
  
export function createErrorResponse(errorCode: number, message: string): ErrorResponse {
    return {
      status: false,
      data: {
        errorCode: errorCode,
        message: message,
      },
    };
}