const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const CustomError = require("../Utils/CustomError");
const jwt = require("jsonwebtoken");
const util = require("util");
const User = require("../Models/userModel");
const sendEmail = require("../Utils/email");

const decodedToken = async (encryptedToken) => {};

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

  //2: Check: If token exist, verify token
  const decodedToken = await util.promisify(jwt.verify)(
    jwtToken,
    process.env.JWT_SECRET
  );

  //3: Check: If user exist or not in db
  const user = await User.findById(decodedToken.id);

  if (!user) {
    next(new CustomError("User with given token doesn't exist", 401));
  }
  //4: Check: if user changed password after token issued
  if (await user.isPasswordChanged(decodedToken.iat)) {
    return next(
      new CustomError("Password has changed recently. Please Login again", 401)
    );
  }

  //5: Allow access to routes
  req.user = user; //Attaching user object to req object
  next();
});

exports.isAuthorized = (role) => {
  return (req, res, next) => {
    if (role !== req.user.role) {
      const error = new CustomError(
        "You don not have permission to perform this task.",
        403
      );
      return next(error);
    }

    next();
  };
};

exports.forgotPassword = asyncErrorHandler(async (req, res, next) => {
  //1: Get User based on requested email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new CustomError(
      "User with provided email doesn't exist",
      404
    );
    return next(error);
  }

  //2: Generate a reset token - this "createResetPasswordToken()" created in User model
  const resetToken = user.createResetPasswordToken();

  //if we go to createResetPasswordToken(), we created resetToken and it's expiry and assigned
  //those values into existing schema, so that's why below line added to save changes into db
  await user.save({ validateBeforeSave: false });

  //3: Send token back to the client's email
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `We have received a password reset request. Please use below link to reset you password\n\n${resetUrl}\n\nThis link will be valid for 10 min only`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Change Request",
      message: message,
    });
    res.status(200).json({
      status: "success",
      message: "Password reset link send to the user email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;

    user.save({ validateBeforeSave: false });

    return next(
      new CustomError(
        "There was an error sending password reset email. Please try again later.",
        500
      )
    );
  }
});
exports.resetPassword = (req, res, next) => {};
