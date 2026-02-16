import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { comparePassword, generateToken } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  const action = pathSegments[0];

  try {
    if (action === 'login' && req.method === 'POST') {
      return handleLogin(req, res);
    }

    if (action === 'logout' && req.method === 'POST') {
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = generateToken(user.username, user.role);

  return res.status(200).json({
    token,
    username: user.username,
  });
}
