import "dotenv/config.js";
import mongoose from "mongoose";
import { Category } from "../src/models/Category.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";
const KEEP_EXISTING = process.env.KEEP === "1";

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    if (!KEEP_EXISTING) {
      await Category.deleteMany({});
      console.log("🗑️  Old categories cleared");
    } else {
      console.log("↪️  KEEP=1 → keeping existing categories");
    }

    const categories = [
      { title: "Earphones", subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/earphone.png", order: 1 },
      { title: "Gadget",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/watch.png", order: 2 },
      { title: "Laptop",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/macbook.png", order: 3 },
      { title: "Console",   subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/gaming.png", order: 4 },
      { title: "Oculus",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/vr.png", order: 5  },
      { title: "Speakers",  subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/speaker.png", order: 6 },
    ];

    if (KEEP_EXISTING) {
      let created = 0;
      for (const c of categories) {
        const found = await Category.findOne({ title: c.title }).lean();
        if (!found) { await Category.create(c); created++; }
      }
      console.log(`📦 Upsert mode (KEEP=1): inserted ${created} new categories`);
    } else {
      await Category.insertMany(categories);
      console.log(`🎉 Seeded ${categories.length} categories`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
