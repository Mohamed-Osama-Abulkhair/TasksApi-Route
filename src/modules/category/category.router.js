import express from "express";
import * as categoryController from "./category.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { protectRoutes } from "../../middleware/protectFuns.js";

const categoryRouter = express.Router();

categoryRouter
  .route("/")
  .post(
    protectRoutes,
    validation(createCategorySchema),
    categoryController.addCategory
  )
  .get(categoryController.getAllCategories);

categoryRouter
  .route("/:id")
  .get(validation(getCategorySchema), categoryController.getCategory)
  .put(
    protectRoutes,
    validation(updateCategorySchema),
    categoryController.updateCategory
  )
  .delete(
    protectRoutes,
    validation(getCategorySchema),
    categoryController.deleteCategory
  );

export default categoryRouter;
