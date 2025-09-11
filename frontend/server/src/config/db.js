import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/e-commerce";
  if (!uri) throw new Error("Missing MONGODB_URI in .env");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  const c = mongoose.connection;
  console.log("✅ Mongo connected:", c.host, c.port, "db:", c.name);
}
