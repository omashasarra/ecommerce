// server/src/models/Banner.js
import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema(
  {
    // position lets you pin banners to Home slots (e.g., "home-1", "home-2")
    position: { type: String, required: true, unique: true, trim: true },

    discount: { type: String, default: "" },
    title:    { type: String, default: "" },
    date:     { type: String, default: "" },

    // store just a filename (e.g. "headphone.png") that lives in /public/banner/
    image:    { type: String, default: "" },

    title2:   { type: String, default: "" },
    title3:   { type: String, default: "" },
    title4:   { type: String, default: "" },

    bgColor:  { type: String, default: "#000000" }, // hex color
    isActive: { type: Boolean, default: true },
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = mongoose.model("Banner", BannerSchema);
