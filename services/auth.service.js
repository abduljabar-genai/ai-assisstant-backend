import Student from '../model/student.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../model/refreshToken.model.js';
import env from '../config/env.js';

const SALT_ROUNDS = 10;
const JWT_SECRET = env.JWT_SECRET;

const publicStudent = (student) => {
  const obj = student.toObject ? student.toObject() : { ...student };
  delete obj.password;
  return obj;
};

export async function signUpUserService(studentData) {
  const { name, email, password } = studentData;

  if (!name || !email || !password) {
    throw new Error('name, email and password are required');
  }

  const existing = await Student.findOne({ email });
  if (existing) {
    throw new Error('An account with this email already exists');
  }

  const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const student = await Student.create({ name, email, password: hashPassword });

  return publicStudent(student);
}

export async function loginUserService(studentData) {
  const { email, password } = studentData;

  if (!email || !password) {
    throw new Error('email and password are required');
  }

  const student = await Student.findOne({ email });
  if (!student) {
    throw new Error('Invalid credentials');
  }

  const match = await bcrypt.compare(password, student.password);
  if (!match) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userID: student._id, role: student.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { token, student: publicStudent(student) };
}

// Hash token before storing in DB (SHA-256)
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Generate random refresh token
export const generateCryptoRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Generate JWT Access Token
export const generateAccessToken = (user) => {
  return jwt.sign({ userID: user._id, role: user.role || 'student' }, JWT_SECRET, {
    expiresIn: '15m',
  });
};

// Store new refresh token in DB
export const saveRefreshTokenToDB = async (userId) => {
  const rawRefreshToken = generateCryptoRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({ userId, tokenHash, expiresAt });

  return { rawRefreshToken, expiresAt };
};

// Rotate Refresh Token (reuse detection: token is deleted on use)
export const rotateRefreshToken = async (rawRefreshToken) => {
  const tokenHash = hashToken(rawRefreshToken);

  const existingTokenDoc = await RefreshToken.findOne({ tokenHash });
  if (!existingTokenDoc) {
    throw new Error('Invalid or revoked refresh token');
  }

  await RefreshToken.deleteOne({ _id: existingTokenDoc._id });

  const student = await Student.findById(existingTokenDoc.userId);
  if (!student) {
    throw new Error('User no longer exists');
  }

  const newAccessToken = generateAccessToken(student);
  const { rawRefreshToken: newRefreshToken, expiresAt } =
    await saveRefreshTokenToDB(student._id);

  return { newAccessToken, newRefreshToken, expiresAt };
};
