import AppError from "../utils/appError.util.js";

function sendErrorInDevelopment(error, response) {
  response.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stackTrace: error.stack,
  });
}

function sendErrorInProduction(error, response) {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    response.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
}

export function globalErrorHandler(error, request, response, next) {
  if (response.headersSent) {
    return next(error);
  }

  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  const nodeEnv = (process.env.NODE_ENV || "development").trim();

  if (nodeEnv === "development") {
    sendErrorInDevelopment(error, response);
  } else {
    let myCustomError = error;

    if (myCustomError?.name === "CastError") {
      myCustomError = handleCastErrorDB(error);
    }

    if (myCustomError?.errorResponse?.code === 11000 || myCustomError?.code === 11000) {
      myCustomError = handleDuplicateFieldsDB(error);
    }

    if (myCustomError?.name === "ValidationError") {
      myCustomError = handleValidationErrorDB(error);
    }

    sendErrorInProduction(myCustomError, response);
  }
}

function handleCastErrorDB(error) {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(error) {
  const match = (error?.errorResponse?.errmsg || error?.errmsg || error?.message || "").match(/([\'"])(.*?)\1/);
  const value = match ? match[0].slice(1, -1) : "value";
  const message = `Duplicate field value: ${value}. Please use another value!`;

  return new AppError(message, 400);
}

function handleValidationErrorDB(error) {
  const errors = Object.values(error.errors || {}).map((element) => element.message);

  const message = `Invalid data input: ${errors.join(". ")}`;
  return new AppError(message, 400);
}