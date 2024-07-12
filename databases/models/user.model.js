import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "user name required"],
      minLength: [3, "too short user name"],
      unique: [true, "name must be unique"],
    },

    email: {
      type: String,
      trim: true,
      required: [true, "email required"],
      minLength: [5, "too short email"],
      maxLength: [100, "too long email"],
      unique: [true, "email must be unique"],
      lowercase: true,
      validate: {
        validator: function (value) {
          // Regular expression for basic email validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format.",
      },
    },

    password: {
      type: String,
      required: true,
      minLength: [8, "password must be greater than 7 characters"],
    },

    passwordChangedAt: Date,
    loginChangedAt: Date,
  },

  { timestamps: true }
);

userSchema.pre("save", function () {
  if (this.password)
    this.password = bcrypt.hashSync(this.password, Number(process.env.Round));
});

userSchema.pre("findOneAndUpdate", function () {
  if (this._update.password)
    this._update.password = bcrypt.hashSync(
      this._update.password,
      Number(process.env.Round)
    );
});

export const userModel = mongoose.model("user", userSchema);
