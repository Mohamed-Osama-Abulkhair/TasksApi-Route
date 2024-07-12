import express from "express";
import * as userController from "./user.controller.js";
import { protectRoutes } from "../../middleware/protectFuns.js";
import {
  changePasswordSchema,
  createUserSchema,
  getUserSchema,
  loginSchema,
  updateUserSchema,
} from "./user.validation.js";
import { validation } from "../../middleware/validation.js";

const userRouter = express.Router();

userRouter
  .route("/")
  .post(validation(createUserSchema), userController.signUp)
  .get(userController.getAllUsers)
  .put(protectRoutes, validation(updateUserSchema), userController.updateUser)
  .delete(protectRoutes, userController.deleteUser)
  .patch(
    protectRoutes,
    validation(changePasswordSchema),
    userController.changeUserPassword
  );

userRouter.post("/login", validation(loginSchema), userController.signIn);

userRouter.route("/:id").get(validation(getUserSchema), userController.getUser);

userRouter.post("/logOut", protectRoutes, userController.logOut);

export default userRouter;
