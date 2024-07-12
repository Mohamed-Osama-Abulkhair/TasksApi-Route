import jwt from "jsonwebtoken";
import { userModel } from "../../databases/models/user.model.js";
import { appError } from "../utils/appError.js";
import { catchAsyncError } from "./catchAsyncError.js";

const mainFun = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return next(new appError("token not provided", 400));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_secretKey);
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new appError("invalid token", 401));
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  const user = await userModel.findById(decoded.userId);
  if (!user)
    return next(new appError("deleted user , old or invalid token", 498));

  if (user.passwordChangedAt) {
    const passwordChangedDate = parseInt(
      user.passwordChangedAt.getTime() / 1000
    );
    if (passwordChangedDate > decoded.iat)
      return next(new appError("old or invalid token", 498));
  }

  if (user.loginChangedAt) {
    const loginChangedDate = parseInt(user.loginChangedAt.getTime() / 1000);
    if (loginChangedDate > decoded.iat)
      return next(new appError("old or invalid token", 498));
  }

  req.user = user;
};

const protectRoutes = catchAsyncError(async (req, res, next) => {
  await mainFun(req, res, next);

  next();
});

export { protectRoutes, mainFun };
