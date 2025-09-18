// server/scripts/seed-admin.js  (ESM)
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js'; // keep if it's a named export

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI');

  const ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);
  const email = (process.env.ADMIN_EMAIL ?? 'admin@example.com').toLowerCase();
  const name  = process.env.ADMIN_NAME  ?? 'Admin';
  const pass  = process.env.ADMIN_PASSWORD ?? 'ChangeMeNow!123';
  const reset = String(process.env.RESET_ADMIN_PASSWORD ?? 'true').toLowerCase() === 'true';

  console.log('Seeding into:', uri);
  await mongoose.connect(uri);

  // Include passwordHash if your schema uses select:false
  let user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    const passwordHash = await bcrypt.hash(pass, ROUNDS);
    await User.create({
      email,
      name,
      passwordHash,
      role: 'admin',
      isAdmin: true,
      status: 'active',
    });
    console.log('✅ Admin created:', email);
  } else {
    const update = {
      name,
      role: 'admin',
      isAdmin: true,
      status: user.status ?? 'active',
    };
    if (reset) {
      update.passwordHash = await bcrypt.hash(pass, ROUNDS);
      console.log('🔑 Admin password reset');
    }
    await User.updateOne({ _id: user._id }, { $set: update });
    console.log('✅ Admin ensured:', email);
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
