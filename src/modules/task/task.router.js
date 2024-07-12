import express from "express";
import * as taskController from "./task.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createTaskSchema,
  getTaskSchema,
  updateTaskSchema,
} from "./task.validation.js";
import { protectRoutes } from "../../middleware/protectFuns.js";

const taskRouter = express.Router();

taskRouter
  .route("/")
  .post(protectRoutes, validation(createTaskSchema), taskController.addTask)
  .get(taskController.getAllTasks);

taskRouter.route("/public").get(taskController.getAllPublicTasks);

taskRouter
  .route("/private")
  .get(protectRoutes, taskController.getAllPrivateTasks);

taskRouter
  .route("/:id")
  .get(validation(getTaskSchema), taskController.getTask)
  .put(protectRoutes, validation(updateTaskSchema), taskController.updateTask)
  .delete(protectRoutes, validation(getTaskSchema), taskController.deleteTask);

export default taskRouter;
