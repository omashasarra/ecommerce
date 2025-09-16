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
const ok = (user, token) => ({ token, user: { id: user._id, email: user.email, name: user.name, role: user.role } });
const bad = (status, message) => ({ status, body: { error: { message } } });

// POST /api/auth/signup
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json(bad(400, 'email, name and password are required').body);

    // normalize before querying
    const emailNorm = String(email).trim().toLowerCase();
    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(409).json(bad(409, 'Email already in use').body);

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email: emailNorm, name: name.trim(), passwordHash, role: 'user' });
    const token = sign(user);
    return res.status(201).json(ok(user, token));
  } catch (err) {
    // handle unique index race
    if (err?.code === 11000) return res.status(409).json(bad(409, 'Email already in use').body);
    next(err);
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json(bad(400, 'email and password are required').body);

    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) return res.status(401).json(bad(401, 'Invalid credentials').body);

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json(bad(401, 'Invalid credentials').body);

    const token = sign(user);
    return res.json(ok(user, token));
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.sub).lean();
    if (!user) return res.status(404).json(bad(404, 'User not found').body);
    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    next(err);
  }
});

export default authRouter;
