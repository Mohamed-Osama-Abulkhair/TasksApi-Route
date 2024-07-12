import { categoryModel } from "../../../databases/models/category.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { taskModel } from "../../../databases/models/task.model.js";
import { mainFun } from "../../middleware/protectFuns.js";

// 1- add task
const addTask = catchAsyncError(async (req, res, next) => {
  const { category } = req.body;
  const foundedCategory = await categoryModel.findOne({
    _id: category,
    user: req.user._id,
  });
  if (!foundedCategory)
    return next(
      new appError("category not found or you aren't the author", 404)
    );

  const result = new taskModel({
    ...req.body,
    user: req.user._id,
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all tasks
const getAllTasks = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(taskModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalTasks = await taskModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not categories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalTasks);
  result.length &&
    res.status(200).json({
      message: "success",
      totalTasks,
      metadata: apiFeatures.metadata,
      result,
    });
});

const getAllPublicTasks = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    taskModel.find({ shared: true }),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalTasks = await taskModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not categories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalTasks);
  result.length &&
    res.status(200).json({
      message: "success",
      totalTasks,
      metadata: apiFeatures.metadata,
      result,
    });
});

const getAllPrivateTasks = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    taskModel.find({ shared: false, user: req.user._id }),
    req.query
  )
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalTasks = await taskModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not categories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalTasks);
  result.length &&
    res.status(200).json({
      message: "success",
      totalTasks,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one task
const getTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const task = await taskModel.findById(id);
  if (!task) return next(new appError("task not found", 404));

  if (task.shared == false) {
    await mainFun(req, res, next);
    if (req.user._id.toString() == task.user.toString())
      return res.status(200).json({ message: "success", result: task });

    return next(new appError("you aren't the author", 401));
  }

  res.status(200).json({ message: "success", result: task });
});

// 4- update one task
const updateTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  let task = await taskModel.findOne({ _id: id, user: req.user._id });
  if (!task)
    return next(new appError("task not found or you aren't the author", 404));

  if (req.body.type && req.body.type == "list") {
    task.body = "";
    task.type = req.body.type;
    task.listItems = req.body.listItems;
  }

  if (req.body.type && req.body.type == "text") {
    task.listItems = [];
    task.type = req.body.type;
    task.body = req.body.body;
  }

  req.body.shared ? (task.shared = req.body.shared) : "";
  req.body.category ? (task.category = req.body.category) : "";

  await task.save();
  res.status(200).json({ message: "success", result: task });
});

// 5- delete one task
const deleteTask = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await taskModel.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!category)
    return next(new appError("task not found or you aren't the author", 404));

  res.status(200).json({ message: "success" });
});

export {
  addTask,
  getAllTasks,
  getAllPublicTasks,
  getAllPrivateTasks,
  getTask,
  updateTask,
  deleteTask,
};
