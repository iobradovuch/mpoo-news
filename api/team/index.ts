import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const members = await prisma.teamMember.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
      });
      return res.status(200).json(members);
    }

    if (req.method === 'POST') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const body = req.body;
      const member = await prisma.teamMember.create({
        data: {
          name: body.name,
          position: body.position,
          description: body.description,
          email: body.email || null,
          phone: body.phone || null,
          photoUrl: body.photoUrl || null,
          order: parseInt(body.order) || 1,
          active: body.active === 'true' || body.active === true,
        },
      });
      return res.status(200).json(member);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Team API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
