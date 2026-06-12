import { NextResponse } from 'next/server'

export class ValidationError extends Error {
  status = 400
  details?: Record<string, string[]>
  constructor(message: string, details?: Record<string, string[]>) {
    super(message)
    this.name = 'ValidationError'
    this.details = details
  }
}

export class AuthError extends Error {
  status = 401
  constructor(message = 'Not authenticated') {
    super(message)
    this.name = 'AuthError'
  }
}

export class ForbiddenError extends Error {
  status = 403
  constructor(message = 'Not authorized') {
    super(message)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends Error {
  status = 404
  constructor(message = 'Resource not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class RateLimitError extends Error {
  status = 429
  retryAfter: number
  constructor(retryAfter: number) {
    super('Too many requests')
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}

export class ServerError extends Error {
  status = 500
  constructor(message = 'Internal server error') {
    super(message)
    this.name = 'ServerError'
  }
}

type AppError = ValidationError | AuthError | ForbiddenError | NotFoundError | RateLimitError | ServerError

export function createErrorResponse(error: AppError): NextResponse {
  const headers: Record<string, string> = {}

  if (error instanceof RateLimitError) {
    headers['Retry-After'] = String(error.retryAfter)
  }

  const body: Record<string, unknown> = { error: error.message }

  if (error instanceof ValidationError && error.details) {
    body.details = error.details
  }

  return NextResponse.json(body, { status: error.status, headers })
}

export function handleRouteError(err: unknown): NextResponse {
  console.error('[API Error]', err)

  if (
    err instanceof ValidationError ||
    err instanceof AuthError ||
    err instanceof ForbiddenError ||
    err instanceof NotFoundError ||
    err instanceof RateLimitError ||
    err instanceof ServerError
  ) {
    return createErrorResponse(err)
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
