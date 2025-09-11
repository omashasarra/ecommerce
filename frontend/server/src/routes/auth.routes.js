import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/requireAuth.js';

export const authRouter = Router();

function sign(user) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// POST /api/auth/signup
authRouter.post('/signup', async (req, res) => {
  const { email, name, password } = req.body || {};
  if (!email || !name || !password) return res.status(400).json({ error: 'Missing fields' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ error: 'Email already in use' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, passwordHash, role: 'user' });
  const token = sign(user);

  res.status(201).json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});

// POST /api/auth/login
// ...
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  // TEMP: basic sanity log (remove later)
  console.log("[AUTH] login attempt:", email);

  // 🔧 important — normalize email before findOne
  const user = await User.findOne({ email: String(email || "").toLowerCase() });
  if (!user) {
    console.log("[AUTH] no user for", email);
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await user.comparePassword(password);
  console.log("[AUTH] password ok?", ok);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = sign(user);
  res.json({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
});


// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user._id, email: user.email, name: user.name, role: user.role });
});


export default authRouter;