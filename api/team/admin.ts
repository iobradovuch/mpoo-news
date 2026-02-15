import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = requireAdmin(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Admin endpoint - return all members (including inactive)
    const members = await prisma.teamMember.findMany({
      orderBy: { order: 'asc' },
    });

    return res.status(200).json(members);
  } catch (error) {
    console.error('Team admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
