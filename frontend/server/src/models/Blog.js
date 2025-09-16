// src/models/Blog.js
import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    author: { type: String, default: "" },
    publishedAt: { type: Date, default: null },
    image: { type: String, default: "" },
    aosDelay: { type: Number, default: 0, min: 0, max: 5000 },

    // NEW: content fields
    // Short paragraph shown on click (HTML allowed)
    excerpt: { type: String, default: "", trim: true },
    // Full article HTML
    content: { type: String, default: "" },

    // Management
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Useful sort index (active first, then order, newest update)
BlogSchema.index({ isActive: 1, order: 1, updatedAt: -1 });

export const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
