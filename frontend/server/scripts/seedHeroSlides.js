// scripts/seedHeroSlides.js
import "dotenv/config.js";
import mongoose from "mongoose";
import { HeroSlide } from "../src/models/HeroSlide.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";
const KEEP_EXISTING = process.env.KEEP === "1";

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    if (!KEEP_EXISTING) {
      await HeroSlide.deleteMany({});
      console.log("🗑️  Old hero slides cleared");
    } else {
      console.log("↪️  KEEP=1 → keeping existing slides (upsert only new)");
    }

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
        buttonLabel: "Shop By category",
        order: 3,
        isActive: true,
      },
    ];

    if (KEEP_EXISTING) {
      let created = 0;
      for (const s of slides) {
        const found = await HeroSlide.findOne({ title: s.title, title2: s.title2 }).lean();
        if (!found) { await HeroSlide.create(s); created++; }
      }
      console.log(`📦 Upsert mode (KEEP=1): inserted ${created} new slides`);
    } else {
      await HeroSlide.insertMany(slides);
      console.log(`🎉 Seeded ${slides.length} hero slides`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
