// scripts/reset-or-create-admin.cjs
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/e-commerce';
const coll = process.env.USERS_COLLECTION || 'users';
const passField = process.env.PASS_FIELD || 'passwordHash';

(async () => {
  const email = process.argv[2] || 'admin@example.com';
  const newPass = process.argv[3] || 'ChangeMeNow!123';

  await mongoose.connect(uri);

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), coll);
  const hash = await bcrypt.hash(newPass, 12);

  let user = await User.findOne({ email });
  if (!user) {
    await User.create({
      email,
      [passField]: hash,
      role: 'admin',
      isAdmin: true,
      status: 'active'
    });
    console.log(`✅ Created admin ${email}`);
  } else {
    await User.updateOne(
      { _id: user._id },
      { $set: { [passField]: hash, role: 'admin', isAdmin: true, status: 'active' } }
    );
    console.log(`✅ Reset password for ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
})();
