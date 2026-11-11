import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// Verifies the short-lived access token and attaches the decoded payload to req.user.
export const verifyAccessToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: access token missing' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Reads the httpOnly refresh token cookie and stores the raw value on req.refreshToken.
const verifyRefreshToken = (req, res, next) => {
  const refreshToken = req.cookies?.refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Unauthorized: refresh token cookie missing' });
  }

  req.refreshToken = refreshToken;
  next();
};

export default verifyRefreshToken;
