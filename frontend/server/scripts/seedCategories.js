// scripts/seed-categories.js
import mongoose from "mongoose";
import { Category } from "../src/models/Category.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/services"; // force services DB
const KEEP_EXISTING = false; // set to true if you want to keep existing categories

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    const categories = [
      { title: "Earphones", subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/earphone.png", order: 1 },
      { title: "Gadget",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/watch.png", order: 2 },
      { title: "Laptop",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/macbook.png", order: 3 },
      { title: "Console",   subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/gaming.png", order: 4 },
      { title: "Oculus",    subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/vr.png", order: 5 },
      { title: "Speakers",  subtitleTop: "Enjoy", subtitleMid: "With", buttonLabel: "Browse", imageUrl: "/category/speaker.png", order: 6 },
    ];

    if (KEEP_EXISTING) {
      let created = 0;
      for (const c of categories) {
        const found = await Category.findOne({ title: c.title }).lean();
        if (!found) {
          await Category.create(c);
          created++;
        }
      }
      console.log(`📦 Upsert mode (KEEP_EXISTING=true): inserted ${created} new categories`);
    } else {
      await Category.deleteMany({});
      console.log("🗑️ Old categories cleared");

      await Category.insertMany(categories);
      console.log(`🎉 Seeded ${categories.length} categories into 'services' DB`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
