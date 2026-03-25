import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { ACCESS_TOKEN_SECRET } from './auth.mjs';

function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function validateId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params._id)) {
    return res.status(404).json({ error: "Not found" });
  }
  next();
}

export { requireAuth, validateId };
