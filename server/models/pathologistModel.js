import mongoose from "mongoose";

const pathologistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    laboratoryName: {
      type: String,
      required: true,
    },

    laboratoryAddress: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      default: 0,
    },

    qualification: {
      type: String,
      required: true,
    },

    specialization: [
      {
        type: String,
      },
    ],

    phone: {
      type: String,
    },

    email: {
      type: String,
    },

    consultationFee: {
      type: Number,
      default: 0,
    },

    workingHours: {
      start: {
        type: String,
      },

      end: {
        type: String,
      },
    },

    workingDays: [
      {
        type: String,
        enum: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
      },
    ],

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Pathologist = mongoose.model("Pathologist", pathologistSchema);

export default Pathologist;
