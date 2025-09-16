// server/src/models/Category.js
import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    subtitleTop: { type: String, default: "Enjoy" },
    subtitleMid: { type: String, default: "With" },
    buttonLabel: { type: String, default: "Browse" },
    imageUrl:       { type: String, required: true, trim: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", CategorySchema);
