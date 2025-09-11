import mongoose from "mongoose";

// Category model
const CategorySchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    subtitleTop: { type: String, default: "Enjoy" },
    subtitleMid: { type: String, default: "With" },
    buttonLabel: { type: String, default: "Browse" },
    imageUrl:    { type: String, required: true },
    order:       { type: Number, default: 0 },   // ✅ new
  },
  { timestamps: true }
);


export const Category = mongoose.model("Category", CategorySchema);
