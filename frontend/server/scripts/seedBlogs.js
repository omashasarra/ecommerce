// scripts/seed-blogs.js
import mongoose from "mongoose";
import { Blog } from "../src/models/Blog.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/services"; // force services DB

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
        excerpt:
          "<p><strong>Smartwatch tips:</strong> focus on battery life, health sensors, and strap comfort.</p>",
        content:
          "<p><strong>Choosing a smartwatch</strong> starts with your needs—fitness, notifications, or both.</p><p>Look at <em>battery life</em>, comfort, and ecosystem (iOS/Android).</p><ul><li>Heart-rate & SpO2</li><li>GPS accuracy</li><li>Water resistance</li></ul>",
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
        excerpt:
          "<p><strong>Gadget shopping:</strong> set a budget and compare real-world reviews.</p>",
        content:
          "<p>Always check <em>after-sales support</em> and warranty.</p><p>Balance features with price; avoid paying for things you won't use.</p>",
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
        excerpt:
          "<p><strong>VR basics:</strong> resolution and comfort are king.</p>",
        content:
          "<p>Comfort matters for long sessions. <em>Higher resolution</em> reduces screen-door effect.</p><p>Consider content library and PC/mobile compatibility.</p>",
      },
    ];

    await Blog.insertMany(blogs);
    console.log(`🎉 Seeded ${blogs.length} blogs into 'services' DB`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
