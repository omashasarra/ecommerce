// scripts/seed-hero-slides.js
import mongoose from "mongoose";
import { HeroSlide } from "../src/models/HeroSlide.js";

const MONGO_URL = "mongodb://127.0.0.1:27017/services"; // force services DB
const KEEP_EXISTING = false; // set true if you want to keep existing slides

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    const slides = [
      {
        subtitle: "Beats Solo",
        title: "Wireless",
        title2: "Headphone",
        img: "/hero/headphone.png",
        buttonLabel: "Shop By Category",
        order: 1,
        isActive: true,
      },
      {
        subtitle: "Beats Solo",
        title: "Wireless",
        title2: "Virtual",
        img: "/category/vr.png",
        buttonLabel: "Shop By Category",
        order: 2,
        isActive: true,
      },
      {
        subtitle: "Beats Solo",
        title: "Branded",
        title2: "Laptops",
        img: "/category/macbook.png",
        buttonLabel: "Shop By Category",
        order: 3,
        isActive: true,
      },
    ];

    if (KEEP_EXISTING) {
      let created = 0;
      for (const s of slides) {
        const found = await HeroSlide.findOne({ title: s.title, title2: s.title2 }).lean();
        if (!found) {
          await HeroSlide.create(s);
          created++;
        }
      }
      console.log(`📦 Upsert mode (KEEP_EXISTING=true): inserted ${created} new slides`);
    } else {
      await HeroSlide.deleteMany({});
      console.log("🗑️ Old hero slides cleared");

      await HeroSlide.insertMany(slides);
      console.log(`🎉 Seeded ${slides.length} hero slides into 'services' DB`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
