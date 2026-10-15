import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter Name:"],
    },
    phone: {
      type: String,
      required: [true, "Please Enter Phone No:"],
    },
    email: {
      type: String,
      required: [true, "Please Enter Email:"],
    },
    password: {
      type: String,
      required: [true, "Please Enter Password:"],
    },
    age: {
      type: Number,
      // required: [true, "Please Enter Age: "],
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      // required: [true, "Please Enter Gender!"],
    },
    address: {
      type: String,
    },
    userType: {
      type: String,
      enum: ["USER", "DOCTOR", "PATHOLOGIST", "ADMIN"],
      required: true,
      default: "USER",
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
