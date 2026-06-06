export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string) {
    super(`${entity} não encontrado`, 'NOT_FOUND', 404)
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: unknown
  ) {
    super(message, 'VALIDATION_ERROR', 422)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado') {
    super(message, 'FORBIDDEN', 403)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}
