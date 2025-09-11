import "dotenv/config";
import mongoose from "mongoose";
import { ServiceFeature } from "../src/models/ServiceFeature.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/e-commerce";
const KEEP = process.env.KEEP === "1";

async function run() {
  await mongoose.connect(MONGO_URL);
  if (!KEEP) await ServiceFeature.deleteMany({});

  await ServiceFeature.insertMany([
    { title: "Free Shipping",       description: "Free shipping on all orders",     iconKey: "car",        order: 1, isActive: true },
    { title: "Safe Money",          description: "30 days money back",              iconKey: "check",      order: 2, isActive: true },
    { title: "Secure Payment",      description: "All payments are secure",         iconKey: "wallet",     order: 3, isActive: true },
    { title: "Online Support 24/7", description: "Technical support 24/7",          iconKey: "headphones", order: 4, isActive: true },
  ]);

  console.log("Seeded services");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
