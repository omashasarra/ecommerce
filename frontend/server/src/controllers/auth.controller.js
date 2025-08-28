import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: u._id, email: u.email, role: u.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, user: { email: u.email, role: u.role } });
  } catch (e) { next(e); }
}
