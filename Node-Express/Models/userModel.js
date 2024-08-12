const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter you name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email!"],
  },
  photo: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 8,
    //Password field will not be included in res that will send back to client
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Please confirm your password!"],
    validate: {
      //This validator will only work for save() & create()
      validator: function (val) {
        return this.password === val;
      },
      message: "Password & ConfirmPassword does not match!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

//Password encryption logic
userSchema.pre("save", async function (next) {
  //isModified() is a built in function
  if (!this.isModified("password")) return next();

  //encrypt the password
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//adding method into User model
userSchema.methods.comparePasswordInDb = async function (pswd, pswdDb) {
  return await bcrypt.compare(pswd, pswdDb);
};

//handler to check the password changed or not after issuing JWT
userSchema.methods.isPasswordChanged = async function (JwtTimeStamp) {
  if (this.passwordChangedAt) {
    const passwordChangedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    //password was changed after JWT issued
    return JwtTimeStamp < passwordChangedTimeStamp;
  }
  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  //Generate random string token of 32 characters
  const resetToken = crypto.randomBytes(32).toString("hex");

  //Encrypt the resetToken and save into existing model schema
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //Set resetToken expiry time in mili-seconds
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  //All operations done, send plain generated resetToken
  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
