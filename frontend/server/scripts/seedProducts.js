import "dotenv/config.js";
import mongoose from "mongoose";
import { Product } from "../src/models/Product.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";
const KEEP_EXISTING = process.env.KEEP === "1";

// From your frontend products
const rawRows = [
  { title: "Boat Headphone", price: 120, imageURL: "/product/p-1.jpg" },
  { title: "Rocky Mountain", price: 420, imageURL: "/product/p-2.jpg" },
  { title: "Goggles",        price: 320, imageURL: "/product/p-3.jpg" },
  { title: "Printed",        price: 220, imageURL: "/product/p-4.jpg" },
  { title: "Boat Headphone", price: 120, imageURL: "/product/p-5.jpg" },
  { title: "Rocky Mountain", price: 420, imageURL: "/product/p-9.jpg" },
  { title: "Goggles",        price: 320, imageURL: "/product/p-7.jpg" },
  { title: "Printed",        price: 220, imageURL: "/product/p-5.jpg" },
];

const seedRows = rawRows.map((r, idx) => ({
  ...r,
  currency: "USD",
  stock: 50,
  sku: `SKU-${idx + 1}`,
  isActive: true,
  order: idx,
  description: "",
  tags: [],
  // categoryId: null,
}));

async function run() {
  try {
    await mongoose.connect(MONGO_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ Connected to MongoDB:", MONGO_URL);

    if (!KEEP_EXISTING) {
      await Product.deleteMany({});
      console.log("🗑️  Old products cleared");
      await Product.insertMany(seedRows);
      console.log(`🎉 Seeded ${seedRows.length} products`);
    } else {
      console.log("↪️  KEEP=1 → upsert mode");
      let created = 0;
      // upsert by (title + imageURL + price) to avoid duplicates
      for (const row of seedRows) {
        const found = await Product.findOne({
          title: row.title,
          imageURL: row.imageURL,
          price: row.price
        }).lean();
        if (!found) { await Product.create(row); created++; }
      }
      console.log(`📦 Inserted ${created} new products`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
