import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { VercelRequest } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-in-production';
const JWT_EXPIRATION = '24h';

interface JwtPayload {
  username: string;
  role: string;
}

export function generateToken(username: string, role: string): string {
  return jwt.sign({ username, role } as JwtPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function extractToken(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function requireAuth(req: VercelRequest): JwtPayload | null {
  const token = extractToken(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAdmin(req: VercelRequest): JwtPayload | null {
  const user = requireAuth(req);
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
