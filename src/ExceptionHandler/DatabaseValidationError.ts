export class DatabaseError extends Error {
  constructor(message: string | undefined) {
    super(message ?? undefined);
    this.name = "DatabaseError"; // Optional: set the error name
    // Ensure the stack trace is captured properly
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, DatabaseError);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

export class DataValidationError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = 'DataValidationError';
  }
}
