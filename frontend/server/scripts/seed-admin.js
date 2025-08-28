import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../src/models/user.model.js';

const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD in .env'); process.exit(1);
}

await mongoose.connect(MONGODB_URI);
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
const exists = await User.findOne({ email: ADMIN_EMAIL });
if (exists) {
  exists.passwordHash = passwordHash; exists.role = 'admin'; await exists.save();
  console.log('Updated existing admin:', ADMIN_EMAIL);
} else {
  await User.create({ email: ADMIN_EMAIL, passwordHash, role: 'admin' });
  console.log('Created admin:', ADMIN_EMAIL);
}
await mongoose.disconnect();
process.exit(0);
