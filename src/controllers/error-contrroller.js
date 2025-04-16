import AppError from './../utils/appError.js';

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(" ")}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const names = Object.keys(err.keyValue);
  const value = Object.values(err.keyValue);
  const message = `Duplicate ${names[0]} value: ${value}, please use another value!`;
  return new AppError(message, 400);
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTErrorDB = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTexpiredErrorDB = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.code === 11000) error = handleDuplicateErrorDB(err);
    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTErrorDB(err);
    if (err.name === "TokenExpiredError") error = handleJWTexpiredErrorDB(err);
    if (err.name === "MongooseError") error = new AppError(err.message, 400);

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
