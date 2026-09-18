/**
 * RAYVEN - Error Handling Architecture
 * Clean, structured error models for application runtime, API responses, and UI fallbacks
 */

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message, 'VALIDATION_FAILED', 422, { fieldErrors });
    this.fieldErrors = fieldErrors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required to access this resource') {
    super(message, 'UNAUTHENTICATED', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'You do not have permission to execute this operation') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resourceName: string, identifier?: string) {
    const msg = identifier
      ? `${resourceName} with ID '${identifier}' was not found`
      : `${resourceName} was not found`;
    super(msg, 'NOT_FOUND', 404);
  }
}

export class InventoryConflictError extends AppError {
  constructor(sku: string, requested: number, available: number) {
    super(
      `Insufficient inventory for item ${sku}. Requested: ${requested}, Available: ${available}`,
      'INVENTORY_SHORTAGE',
      409,
      { sku, requested, available }
    );
  }
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
    details?: Record<string, unknown>;
  };
}

export function formatErrorResponse(error: unknown): ApiErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        details: error.details,
      },
    };
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return {
    success: false,
    error: {
      code: 'UNKNOWN_SERVER_ERROR',
      message,
      statusCode: 500,
    },
  };
}
