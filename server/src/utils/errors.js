export class AppError extends Error {
  constructor(code, message, status = 500, details = []) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation error', details = []) {
    super('VALIDATION_ERROR', message, 422, details);
  }
}

export class RateLimitedError extends AppError {
  constructor(message = 'Too many requests, please try again later.') {
    super('RATE_LIMITED', message, 429);
  }
}

export class QuotaExceededError extends AppError {
  constructor(message = 'Daily AI request quota reached. Quota resets at midnight IST.') {
    super('QUOTA_EXCEEDED', message, 429);
  }
}

export class AiError extends AppError {
  constructor(message = 'Failed to generate advisory from AI model') {
    super('AI_ERROR', message, 502);
  }
}

export class AiInvalidOutputError extends AppError {
  constructor(message = 'AI output failed structural validation after retry', details = []) {
    super('AI_INVALID_OUTPUT', message, 502, details);
  }
}

export class UploadError extends AppError {
  constructor(message = 'Invalid upload file') {
    super('UPLOAD_ERROR', message, 400);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
  }
}
