import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { MulterError } from 'multer'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly detail?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, detail?: unknown): ApiError {
    return new ApiError(400, message, 'BAD_REQUEST', detail)
  }
  static unauthorized(message = 'Unauthenticated'): ApiError {
    return new ApiError(401, message, 'UNAUTHENTICATED')
  }
  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(403, message, 'FORBIDDEN')
  }
  static notFound(message = 'Not found'): ApiError {
    return new ApiError(404, message, 'NOT_FOUND')
  }
  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT')
  }
  static internal(message = 'Internal error', detail?: unknown): ApiError {
    return new ApiError(500, message, 'INTERNAL', detail)
  }
}

type PrismaError = { code?: string; meta?: { target?: string[] | string } }

function isPrismaError(err: unknown): err is PrismaError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof (err as { code?: unknown }).code === 'string' &&
    (err as { code: string }).code.startsWith('P')
  )
}

export const errorMiddleware: ErrorRequestHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    next(err)
    return
  }

  if (err instanceof ApiError) {
    res.status(err.status).json({
      error: err.message,
      code: err.code,
      ...(err.detail !== undefined ? { detail: err.detail } : {}),
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation failed',
      code: 'VALIDATION',
      detail: err.issues.slice(0, 10),
    })
    return
  }

  if (err instanceof MulterError) {
    res.status(400).json({
      error: err.message,
      code: 'UPLOAD_ERROR',
    })
    return
  }

  if (isPrismaError(err)) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' })
      return
    }
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Unique constraint violation', code: 'CONFLICT' })
      return
    }
  }

  console.error('[error]', err)
  res.status(500).json({ error: 'Internal error', code: 'INTERNAL' })
}
