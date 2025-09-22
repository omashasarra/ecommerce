// server/scripts/seedServices.js
import "dotenv/config.js";
import mongoose from "mongoose";
import { Service } from "../src/models/Service.js";

const MONGO_URL =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/services";

async function run() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected:", MONGO_URL);

    await Service.deleteMany({});
    console.log("🗑️ Old services cleared");

    const services = [
      {
        title: "Plumbing",
        description: "Fix leaks, install pipes, and bathroom repairs.",
        pricePerHour: 25,
        image: "https://picsum.photos/seed/plumbing/600/400",
      },
      {
        title: "Carpentry",
        description: "Furniture making and wood repairs.",
        pricePerHour: 30,
        image: "https://picsum.photos/seed/carpentry/600/400",
      },
      {
        title: "Electrical",
        description: "Wiring, lighting, and appliance repairs.",
        pricePerHour: 35,
        image: "https://picsum.photos/seed/electrical/600/400",
      },
    ];

    await Service.insertMany(services);
    console.log(`🎉 Seeded ${services.length} services`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
}

run();
