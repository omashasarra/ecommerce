import "dotenv/config.js";
import mongoose from "mongoose";
import Service from "../models/Selling.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected:", MONGO_URL);

    await Service.deleteMany({});
    await Service.insertMany([
      {
        title: "Website Design",
        tagline: "Modern, fast, and responsive",
        price: 899,
        unit: "one-time",
        popular: true,
        features: [
          "Custom Figma → React build",
          "Mobile-first, SEO-ready",
          "1 month of support",
        ],
        cta: "Get a free quote",
        active: true,
      },
      {
        title: "E-Commerce Setup",
        tagline: "Sell online in days, not weeks",
        price: 1299,
        unit: "starter package",
        features: [
          "Product catalog & checkout",
          "Payments & invoices",
          "Analytics dashboard",
        ],
        cta: "Launch my store",
        active: true,
      },
      {
        title: "Growth Marketing",
        tagline: "SEO + Ads that actually convert",
        price: 499,
        unit: "/ month",
        features: [
          "Keyword & content plan",
          "Google/Facebook Ads setup",
          "Monthly reports",
        ],
        cta: "Book a call",
        active: true,
      },
    ]);

    console.log("🎉 Seeded 3 services");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
