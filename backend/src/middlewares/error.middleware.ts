import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ENV } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Prisma unique constraint violation (e.g. duplicate username/email or same day record)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || [];
      sendError(
        res,
        `Unique constraint violation: ${target.join(', ') || 'record already exists'}`,
        409
      );
      return;
    }

    if (err.code === 'P2025') {
      sendError(res, 'Requested record was not found', 404);
      return;
    }
  }

  // General server error
  const message = ENV.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message;
  const errors = ENV.NODE_ENV === 'development' ? err.stack : undefined;

  sendError(res, message, 500, errors);
};
