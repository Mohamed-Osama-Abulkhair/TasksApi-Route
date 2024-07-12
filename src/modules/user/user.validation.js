import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const idSchema = Joi.string().custom(isValidObjectId).required();
const nameSchema = Joi.string().min(3).max(50).trim();
const emailSchema = Joi.string().email().min(5).max(100).trim().lowercase();
const passwordSchema = Joi.string()
  .min(8)
  .max(30)
  .trim()
  .replace(/\s/g, "")
  .pattern(
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])(?=.*[a-zA-Z])\S{8,30}$/,
    "password should be between 8 and 30 characters and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
  );

const createUserSchema = Joi.object({
  name: nameSchema.required(),
  email: emailSchema.required(),
  password: passwordSchema.required(),
});

const loginSchema = Joi.object({
  name: nameSchema.required(),
  password: passwordSchema.required(),
});

const getUserSchema = Joi.object({
  id: idSchema,
});

const updateUserSchema = Joi.object({
  name: nameSchema,
  email: emailSchema,
});

const changePasswordSchema = Joi.object({
  oldPassword: passwordSchema.required(),
  newPassword: passwordSchema.required(),
});

export {
  createUserSchema,
  loginSchema,
  getUserSchema,
  updateUserSchema,
  changePasswordSchema,
};
