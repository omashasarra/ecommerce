// scripts/seedBlogs.js
import "dotenv/config.js";
import mongoose from "mongoose";
import { Blog } from "../src/models/Blog.js";

const MONGO_URL =
  process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    await Blog.deleteMany({});
    console.log("🗑️ Old blogs cleared");

    const now = new Date();

    const blogs = [
      {
        title: "How to choose perfect smartwatch",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        author: "Fairouz",
        publishedAt: now,
        image: "/blogs/blog-1.jpg",
        aosDelay: 0,
        isActive: true,
        order: 1,
      },
      {
        title: "How to choose perfect gadget",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        author: "Ghostly",
        publishedAt: now,
        image: "/blogs/blog-2.jpg",
        aosDelay: 200,
        isActive: true,
        order: 2,
      },
      {
        title: "How to choose perfect VR headset",
        subtitle: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
        author: "Reine",
        publishedAt: now,
        image: "/blogs/blog-3.jpg",
        aosDelay: 400,
        isActive: true,
        order: 3,
      },
    ];

    await Blog.insertMany(blogs);
    console.log(`🎉 Seeded ${blogs.length} blogs`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
