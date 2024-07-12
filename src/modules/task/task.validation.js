import Joi from "joi";
import { isValidObjectId } from "../../middleware/validation.js";

const createTaskSchema = Joi.object({
  type: Joi.string().valid("text", "list").required(),
  body: Joi.when("type", {
    is: "text",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  listItems: Joi.when("type", {
    is: "list",
    then: Joi.array()
      .items(Joi.object({ text: Joi.string().required() }))
      .required(),
    otherwise: Joi.forbidden(),
  }),
  shared: Joi.boolean().default(false),
  category: Joi.string().custom(isValidObjectId).required(),
});

const getTaskSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
});

const updateTaskSchema = Joi.object({
  id: Joi.string().custom(isValidObjectId).required(),
  type: Joi.string().valid("text", "list"),
  body: Joi.when("type", {
    is: "text",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  listItems: Joi.when("type", {
    is: "list",
    then: Joi.array()
      .items(Joi.object({ text: Joi.string().required() }))
      .required(),
    otherwise: Joi.forbidden(),
  }),
  shared: Joi.boolean(),
  category: Joi.string().custom(isValidObjectId),
});

export { createTaskSchema, getTaskSchema, updateTaskSchema };
