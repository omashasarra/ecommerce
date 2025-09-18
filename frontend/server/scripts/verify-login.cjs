// scripts/verify-login.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_db';
const dbName = process.env.MONGODB_DB || undefined;
const email = process.argv[2] || 'admin@example.com';
const plain = process.argv[3] || 'ChangeMeNow!123';

// Adjust if your collection name isn't "users"
const coll = process.env.USERS_COLLECTION || 'users';
// If your password field isn't "password", set PASS_FIELD env (e.g., passwordHash)
const passField = process.env.PASS_FIELD || 'password';

(async () => {
  await mongoose.connect(uri, dbName ? { dbName } : {});
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), coll);

  // If your schema uses select:false, force include:
  const user = await User.findOne({ email }).select(`+${passField}`).lean();

  if (!user) {
    console.error('❌ No user found with email:', email);
    return process.exit(1);
  }

  const hash = user[passField];
  if (!hash || typeof hash !== 'string') {
    console.error(`❌ Field "${passField}" missing. Keys:`, Object.keys(user));
    return process.exit(1);
  }

  if (!hash.startsWith('$2')) {
    console.error('❌ Stored password is not a bcrypt hash. Seed likely saved plaintext.');
    return process.exit(1);
  }

  const ok = await bcrypt.compare(plain, hash);
  console.log('User:', { email: user.email, isAdmin: user.isAdmin, role: user.role, active: user.active });
  console.log(ok ? '✅ Password matches' : '❌ Password does NOT match');
  process.exit(ok ? 0 : 2);
})();
