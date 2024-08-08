class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? "fail" : "error";

    this.isOperational = true;

    //Stack trace - where error occurred exactly
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
