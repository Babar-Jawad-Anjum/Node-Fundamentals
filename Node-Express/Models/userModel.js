const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: 8,
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

const User = mongoose.model("User", userSchema);

module.exports = User;
