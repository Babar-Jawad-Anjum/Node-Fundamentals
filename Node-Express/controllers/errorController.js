const CustomError = require("../Utils/CustomError");

//In dev, we want as much information about error as possible
const devErrors = (res, error) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    error: error,
  });
};

//In prod, we want to leak as little info as possible to avoid any misuse of error messages to secure application from hackers
const prodErrors = (res, error) => {
  //In prod, we want to send only those errors to the client which is an operational error due to security reasons
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  }
  //for other errors i.e created by mongoose etc will be treated as Non-Operational errors
  else {
    res.status(500).json({
      status: "error",
      message: "Something went wrong! Please try agin later!",
    });
  }
};

const castErrorHandler = (err) => {
  const msg = `Invalid value for ${err.path} : ${err.value}`;
  return new CustomError(msg, 400);
};
const duplicateKeyErrorHandler = (err) => {
  const msg = `There is already a movie with name ${err.keyValue.name}. please use another name!`;
  return new CustomError(msg, 400);
};

const validationErrorHandler = (err) => {
  const allValidationErrors = Object.values(err.errors).map(
    (val) => val.message
  );
  const errorMessages = allValidationErrors.join(". ");
  const msg = `Invalid input data: ${errorMessages}`;
  return new CustomError(msg, 400);
};

const handleExpiredJwt = (err) => {
  return new CustomError("Session token has expired! Please login again!", 401);
};
const handleJwtError = (err) => {
  return new CustomError("Invalid Token! Please login again!", 401);
};

//Global error handler function
module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrors(res, error);
  } else if (process.env.NODE_ENV === "production") {
    //CastError means error generated by mongoose, so it should be shown to client
    if (error.name === "CastError") error = castErrorHandler(error);
    //Duplicate key error i.e creating movie with same name etc
    if (error.code === 11000) error = duplicateKeyErrorHandler(error);
    //Mongoose validation errors
    if (error.name === "ValidationError") error = validationErrorHandler(error);
    //jwt expired error
    if (error.name === "TokenExpiredError") error = handleExpiredJwt(error);
    //jwt token tempering error
    if (error.name === "JsonWebTokenError") error = handleJwtError(error);

    prodErrors(res, error);
  }
};
