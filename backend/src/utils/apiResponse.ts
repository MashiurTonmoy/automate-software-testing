import { Response } from 'express';

export interface ApiResponseData<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  payload: ApiResponseData<T>
): Response => {
  return res.status(statusCode).json(payload);
};

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode = 200
): Response => {
  return sendResponse(res, statusCode, {
    success: true,
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown
): Response => {
  return sendResponse(res, statusCode, {
    success: false,
    message,
    errors,
  });
};
