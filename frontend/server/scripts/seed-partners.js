import mongoose, { mongo } from "mongoose";
import dotenv from "dotenv";
import { Partner } from "../src/models/Partner.js";

dotenv.config();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e-commerce";

const sample = [
    { name: "Brand 1", image: "/br-1.png", order: 0, isActive: true },
    { name: "Brand 2", image: "/br-2.png", order: 1, isActive: true },
    { name: "Brand 3", image: "/br-3.png", order: 2, isActive: true },
    { name: "Brand 4", image: "/br-4.png", order: 3, isActive: true },
    { name: "Brand 5", image: "/br-5.png", order: 4, isActive: true },
];

(async () => {
    try {
        console.log("[seed] Cpnnecting:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI, {});

        await Partner.deleteMany({});
        await Partner.insertMany(sample);

        console.log("[seed] Partners inserted");
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error("[seed] Error:", error);
        process.exit(1);
    }
}) ();