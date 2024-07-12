import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
});

const getCategorySchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30),
  id: Joi.string().custom(isValidObjectId).required(),
});

export { createCategorySchema, getCategorySchema, updateCategorySchema };
