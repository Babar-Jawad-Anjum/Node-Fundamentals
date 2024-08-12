const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../Models/userModel");

exports.protectedRoute = asyncErrorHandler(async (req, res, next) => {
  let jwtToken;

  //1: Read the token and check if exist
  const testToken = req.headers.authorization;
  if (testToken && testToken.startsWith("Bearer")) {
    jwtToken = testToken.split(" ")[1];
  }

  if (!jwtToken) {
    next(new CustomError("Unauthorized", 401));
  }

  //2: If token exist, verify token
  const decodedToken = await util.promisify(jwt.verify)(
    jwtToken,
    process.env.JWT_SECRET
  );

  //3: If user exist in db
  const user = await User.findById(decodedToken.id);

  if (!user) {
    next(new CustomError("User with given token doesn't exist", 401));
  }
  //4: if user changed password after token issued
  if (await user.isPasswordChanged(decodedToken.iat)) {
    return next(
      new CustomError("Password has changed recently. Please Login again", 401)
    );
  }

  //5: Allow access to routes
  req.user = user; //Attaching user object to req object
  next();
});
