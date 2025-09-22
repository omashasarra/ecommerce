// server/scripts/seed-partners.js
import mongoose from "mongoose";
import { Partner } from "../src/models/Partner.js";

const MONGODB_URI = "mongodb://127.0.0.1:27017/services"; // force services DB

const sample = [
  { name: "Brand 1", image: "/brand/br-1.png", order: 0, isActive: true },
  { name: "Brand 2", image: "/brand/br-2.png", order: 1, isActive: true },
  { name: "Brand 3", image: "/brand/br-3.png", order: 2, isActive: true },
  { name: "Brand 4", image: "/brand/br-4.png", order: 3, isActive: true },
  { name: "Brand 5", image: "/brand/br-5.png", order: 4, isActive: true },
];

(async () => {
  try {
    console.log("[seed] Connecting:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    await Partner.deleteMany({});
    console.log("[seed] Old partners cleared");

    await Partner.insertMany(sample);
    console.log("[seed] ✅ Partners inserted into 'services' DB");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("[seed] ❌ Error:", error);
    process.exit(1);
  }
})();
