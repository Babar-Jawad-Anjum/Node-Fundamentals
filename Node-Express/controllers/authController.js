const User = require("../Models/userModel");
const asyncErrorHandler = require("../Utils/asyncErrorHandler");
const jwt = require("jsonwebtoken");
const CustomError = require("../Utils/CustomError");

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

exports.signup = asyncErrorHandler(async (req, res, next) => {
  const newUser = await User.create(req.body);

  const token = signToken(newUser._id, newUser.role);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = asyncErrorHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //Check if email & password present in req.body
  if (!email || !password) {
    const error = new CustomError(
      "Please provide email ID & password for login!",
      400
    );
    return next(error);
  }
  //Check if user exist with provided email
  const user = await User.findOne({ email }).select("+password");

  //user is an instance of User Document/model, so we can access methods that we defined in model
  if (!user || !(await user.comparePasswordInDb(password, user.password))) {
    const error = new CustomError("Incorrect email or password!", 400);
    return next(error);
  }

  const token = signToken(user._id, user.role);

  res.status(200).json({
    status: "success",
    token,
  });
});
