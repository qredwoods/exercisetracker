import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import validator from 'validator';
import { createUser, findUserByEmail, verifyPassword } from './userModel.mjs';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 7,                    // 7 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});

router.use('/login', authLimiter);
router.use('/signup', authLimiter);

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret-change-me';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret-change-me';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

const IS_PROD = process.env.NODE_ENV === 'production';

function signAccessToken(userId) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

// ── signup ──────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, ageConfirmed } = req.body;

    if (!ageConfirmed) {
      return res.status(400).json({ error: 'You must confirm you are 13 or older.' });
    }

    if (!firstName?.trim() || !lastName?.trim()) {
      return res.status(400).json({ error: 'First and last name are required.' });
    }

    if (firstName.trim().length > 50 || lastName.trim().length > 50) {
      return res.status(400).json({ error: 'Name must be 50 characters or less.' });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (email.length > 254) {
      return res.status(400).json({ error: 'Email is too long.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password must be 128 characters or less.' });
    }

    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one uppercase letter.' });
    }

    if (!/[a-z]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one lowercase letter.' });
    }

    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'Password must contain at least one number.' });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await createUser(firstName.trim(), lastName.trim(), email, password);

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    res.status(201).json({ user, accessToken });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await verifyPassword(user, password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({ user, accessToken });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── refresh ─────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ error: 'No refresh token.' });
    }

    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);

    // rotate: issue new pair
    const accessToken = signAccessToken(payload.userId);
    const refreshToken = signRefreshToken(payload.userId);
    setRefreshCookie(res, refreshToken);

    res.status(200).json({ accessToken });
  } catch (err) {
    // expired or tampered
    return res.status(401).json({ error: 'Invalid refresh token.' });
  }
});

// ── logout ──────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({ message: 'Logged out.' });
});

export { router as authRouter, ACCESS_TOKEN_SECRET };
