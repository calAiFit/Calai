import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export class AppError extends Error {
  public status: number;
  public code?: string;
  public details?: unknown;

  constructor(message: string, status: number = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error("API Error:", error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: error.errors,
      },
      { status: 400 }
    );
  }

  // Custom app errors
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
      },
      { status: error.status }
    );
  }

  // Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code: string };
    
    switch (prismaError.code) {
      case "P2002":
        return NextResponse.json(
          {
            error: "A record with this information already exists",
            code: "DUPLICATE_RECORD",
          },
          { status: 409 }
        );
      case "P2025":
        return NextResponse.json(
          {
            error: "Record not found",
            code: "NOT_FOUND",
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: "Database error occurred",
            code: "DATABASE_ERROR",
          },
          { status: 500 }
        );
    }
  }

  // Generic errors
  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

export function validateAuth(userId: string | null): void {
  if (!userId) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }
}

export function validateRequired(data: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      throw new AppError(`Missing required field: ${field}`, 400, "MISSING_FIELD");
    }
  }
}

export function validateNumber(value: unknown, field: string, min?: number, max?: number): number {
  const num = Number(value);
  
  if (isNaN(num)) {
    throw new AppError(`Invalid number for field: ${field}`, 400, "INVALID_NUMBER");
  }
  
  if (min !== undefined && num < min) {
    throw new AppError(`${field} must be at least ${min}`, 400, "VALUE_TOO_LOW");
  }
  
  if (max !== undefined && num > max) {
    throw new AppError(`${field} must be at most ${max}`, 400, "VALUE_TOO_HIGH");
  }
  
  return num;
}

export function validateString(value: unknown, field: string, minLength?: number, maxLength?: number): string {
  if (typeof value !== "string") {
    throw new AppError(`Invalid string for field: ${field}`, 400, "INVALID_STRING");
  }
  
  if (minLength !== undefined && value.length < minLength) {
    throw new AppError(`${field} must be at least ${minLength} characters`, 400, "STRING_TOO_SHORT");
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    throw new AppError(`${field} must be at most ${maxLength} characters`, 400, "STRING_TOO_LONG");
  }
  
  return value;
}

export function validateEnum(value: unknown, field: string, allowedValues: string[]): string {
  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new AppError(`${field} must be one of: ${allowedValues.join(", ")}`, 400, "INVALID_ENUM");
  }
  
  return value;
}
