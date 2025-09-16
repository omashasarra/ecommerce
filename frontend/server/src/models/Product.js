// server/src/models/Product.js
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true },
    imageURL:   { type: String, default: "" },       // Admin UI reads imageURL
    price:      { type: Number, required: true, min: 0 },
    currency:   { type: String, default: "USD" },
    stock:      { type: Number, default: 0 },
    sku:        { type: String, default: "" },
    isActive:   { type: Boolean, default: true },
    order:      { type: Number, default: 0 },
    description:{ type: String, default: "" },
    tags:       { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
