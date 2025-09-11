// src/models/HeroSlide.js
import mongoose from "mongoose";

const HeroSlideSchema = new mongoose.Schema(
  {
    subtitle: { type: String, default: "" },
    title:    { type: String, default: "" },
    title2:   { type: String, default: "" },
    img:      { type: String, required: true },
    buttonLabel: { type: String, default: "Shop By Category"},
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const HeroSlide = mongoose.model("HeroSlide", HeroSlideSchema);
