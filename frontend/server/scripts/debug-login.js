import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js';

const email = (process.argv[2] || 'admin@example.com').toLowerCase();
const pass  = process.argv[3] || 'admin123';

async function run() {
  console.log("DB URI:", process.env.MONGODB_URI);
  await mongoose.connect(process.env.MONGODB_URI);

  const user = await User.findOne({ email }).lean();
  console.log("Found user?", !!user, user && { email: user.email, role: user.role, _id: user._id });
  if (!user) return;

  const ok = await bcrypt.compare(pass, user.passwordHash);
  console.log("Password matches?", ok);

  await mongoose.disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
