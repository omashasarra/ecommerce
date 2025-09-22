// server/scripts/seed-admin.js  (ESM)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js'; // adjust path if needed

async function main() {
  // 🔹 Force DB connection directly to "services"
  const uri = "mongodb://127.0.0.1:27017/services";

  const ROUNDS = 12; // bcrypt rounds
  const email = "admin@example.com";
  const name  = "Admin";
  const pass  = "ChangeMeNow!123";
  const reset = true; // always reset password on re-run

  console.log("Seeding into:", uri);
  await mongoose.connect(uri);

  // Include passwordHash if schema uses select:false
  let user = await User.findOne({ email }).select("+passwordHash");

  if (!user) {
    const passwordHash = await bcrypt.hash(pass, ROUNDS);
    await User.create({
      email,
      name,
      passwordHash,
      role: "admin",
      isAdmin: true,
      status: "active",
    });
    console.log("✅ Admin created:", email);
  } else {
    const update = {
      name,
      role: "admin",
      isAdmin: true,
      status: user.status ?? "active",
    };
    if (reset) {
      update.passwordHash = await bcrypt.hash(pass, ROUNDS);
      console.log("🔑 Admin password reset");
    }
    await User.updateOne({ _id: user._id }, { $set: update });
    console.log("✅ Admin ensured:", email);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
