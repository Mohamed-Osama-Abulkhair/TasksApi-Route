import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      unique: [true, "name must be unique"],
      trim: true,
      required: true,
      minLength: [3, "too short category name"],
    },

    user: {
      type: mongoose.Types.ObjectId,
      ref: "user",
      required: [true, "user is required"],
    },
  },
  { timestamps: true }
);

categorySchema.pre(/^find/, function () {
  this.populate("user", "name");
});
export const categoryModel = mongoose.model("category", categorySchema);
