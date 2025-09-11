// server/scripts/seed-admin.js
// Ensure this script is run with Node.js, not in a browser
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/models/User.js'; 

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    console.log("Seeding into:", process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);

  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const name  = process.env.ADMIN_NAME  || 'Admin';
  const pass  = process.env.ADMIN_PASSWORD || 'admin123';

  let user = await User.findOne({ email });
  if (!user) {
    const passwordHash = await bcrypt.hash(pass, 10);
    user = await User.create({ email, name, passwordHash, role: 'admin' });
    console.log(' Admin created:', email);
  } else {
    // ensure role=admin and reset password to match env (optional)
    user.role = 'admin';
    if (process.env.RESET_ADMIN_PASSWORD === 'true') {
      user.passwordHash = await bcrypt.hash(pass, 10);
      console.log('🔑 Admin password reset');
    }
    await user.save();
    console.log(' Admin ensured:', email);
  }

  await mongoose.disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
