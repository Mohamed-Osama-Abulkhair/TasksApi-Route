import { userModel } from "../../../databases/models/user.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

// 1- sign Up
const signUp = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await userModel.findOne({ $or: [{ email }, { name }] });
  if (user) return next(new appError("Email or Name already exists", 409));

  const result = new userModel(req.body);
  await result.save();

  res.status(201).json({ message: "success" });
});

// 2- sign In
const signIn = catchAsyncError(async (req, res, next) => {
  const { name, password } = req.body;

  const user = await userModel.findOne({ name });
  if (!user) return next(new appError("incorrect name or password", 401));
  const match = await bcrypt.compare(password, user.password);

  if (match) {
    const token = jwt.sign(
      { name: user.name, userId: user._id },
      process.env.JWT_secretKey
    );

    return res.json({ message: "success", token });
  }
  next(new appError("incorrect name or password", 401));
});

// 3- update account
const updateUser = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const updatedData = {};

  const user = await userModel.findOne({ $or: [{ email }, { name }] });
  if (user) return next(new appError("Email or Name already exists", 409));

  name ? (updatedData.name = name) : "";
  email ? (updatedData.email = email) : "";

  const result = await userModel
    .findByIdAndUpdate(req.user._id, updatedData, {
      new: true,
    })
    .select("-password");

  res.status(200).json({ message: "success", result });
});

// 4- Delete account
const deleteUser = catchAsyncError(async (req, res, next) => {
  const result = await userModel.findByIdAndDelete(req.user._id);
  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success" });
});

// 5- Update password
const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const match = await bcrypt.compare(oldPassword, req.user.password);
  if (!match) return next(new appError("incorrect password", 401));

  const result = await userModel.findByIdAndUpdate(
    req.user._id,
    { password: newPassword, passwordChangedAt: Date.now() },
    { new: true }
  );

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success" });
});

// 6- Get user account data
const getUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const result = await userModel
    .findById(id)
    .select("-password -passwordChangedAt -loginChangedAt");

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success", result });
});

// 7- Get All users
const getAllUsers = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    userModel.find().select("-password  -passwordChangedAt -loginChangedAt"),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalUsers = await userModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not users added yet", 404));

  apiFeatures.calculateTotalAndPages(totalUsers);
  result.length &&
    res.status(200).json({
      message: "success",
      totalUsers,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 8- Log Out
const logOut = catchAsyncError(async (req, res, next) => {
  const result = await userModel
    .findByIdAndUpdate(
      req.user._id,
      { loginChangedAt: Date.now() },
      { new: true }
    )
    .select("-password");

  !result && next(new appError("user not found", 404));
  result && res.status(200).json({ message: "success" });
});

export {
  signUp,
  signIn,
  updateUser,
  deleteUser,
  getUser,
  changeUserPassword,
  getAllUsers,
  logOut,
};
