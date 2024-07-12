import mongoose from "mongoose";

const taskSchema = mongoose.Schema(
  {
    type: { type: String, enum: ["text", "list"], required: true },

    body: { type: String },

    listItems: [{ text: String }],

    shared: { type: Boolean, default: false },

    category: {
      type: mongoose.Types.ObjectId,
      ref: "category",
      required: [true, "category is required"],
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "user is required"],
    },
  },
  { timestamps: true }
);

taskSchema.pre(/^find/, function () {
  // this.populate("user", "name");
  this.populate("category", "name");
});
export const taskModel = mongoose.model("task", taskSchema);
