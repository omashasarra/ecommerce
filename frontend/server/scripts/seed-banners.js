// server/scripts/seed-banners.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Banner } from "../src/models/Banner.js";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eshop";

const sample = [
  {
    position: "home-1",
    discount: "30% OFF",
    title: "Fine Smile",
    date: "10 Jan to 28 Jan",
    image: "/hero/headphone.png",     
    title2: "Air Solo Bass",
    title3: "Winter Sale",
    title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    bgColor: "#f42c37",
    order: 0,
    isActive: true,
  },
  {
    position: "home-2",
    discount: "30% OFF",
    title: "Happy Hours",
    date: "10 Jan to 28 Jan",
    image: "/catoegory/smartwatch2.png",  
    title2: "Smart Solo",
    title3: "Winter Sale",
    title4: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    bgColor: "#2dcc6f",
    order: 1,
    isActive: true,
  },
];

(async () => {
  try {
    console.log("[seed] Connecting:", MONGODB_URI);
    await mongoose.connect(MONGODB_URI, {});
    await Banner.deleteMany({});
    await Banner.insertMany(sample);
    console.log("[seed] Banners inserted");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
