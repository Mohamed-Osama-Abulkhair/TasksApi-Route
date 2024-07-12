import { categoryModel } from "../../../databases/models/category.model.js";
import { appError } from "../../utils/appError.js";
import { catchAsyncError } from "../../middleware/catchAsyncError.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import * as factory from "../handlers/factory.handler.js";

// 1- add category
const addCategory = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  const founded = await categoryModel.findOne({ name, user: req.user._id });
  if (founded)
    return next(new appError("category name is already exists", 409));

  const result = new categoryModel({
    name,
    user: req.user._id,
  });
  await result.save();

  res.status(201).json({ message: "success", result });
});

// 2- get all categories
const getAllCategories = catchAsyncError(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(categoryModel.find(), req.query)
    .paginate()
    .filter()
    .sort()
    .search()
    .fields();

  const result = await apiFeatures.mongooseQuery.exec();

  const totalCategories = await categoryModel.countDocuments(
    apiFeatures.mongooseQuery._conditions
  );

  !result.length && next(new appError("Not categories added yet", 404));

  apiFeatures.calculateTotalAndPages(totalCategories);
  result.length &&
    res.status(200).json({
      message: "success",
      totalCategories,
      metadata: apiFeatures.metadata,
      result,
    });
});

// 3- get one category
const getCategory = factory.getOne(categoryModel);

// 4- update one category
const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await categoryModel.findOne({ _id: id, user: req.user._id });
  if (!category)
    return next(
      new appError("category not found or you aren't the author", 404)
    );

  const founded = await categoryModel.findOne({ name, user: req.user._id });
  if (founded)
    return next(new appError("category name is already exists", 409));

  category.name = name;
  await category.save();

  res.status(200).json({ message: "success", result: category });
});

// 5- delete one category
const deleteCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const category = await categoryModel.findOneAndDelete({
    _id: id,
    user: req.user._id,
  });

  if (!category)
    return next(
      new appError("category not found or you aren't the author", 404)
    );

  res.status(200).json({ message: "success" });
});

export {
  addCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
};
