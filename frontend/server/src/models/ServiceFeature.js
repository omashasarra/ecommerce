import mongoose from "mongoose";

const ServiceFeatureSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    iconKey:     { type: String, required: true, enum: ["car", "check", "wallet", "headphones"] },
    order:       { type: Number, default: 0 }, 
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ServiceFeature = mongoose.model("ServiceFeature", ServiceFeatureSchema);
