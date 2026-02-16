import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  const firstSegment = pathSegments[0];

  try {
    // /api/team/admin
    if (firstSegment === 'admin' && req.method === 'GET') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const members = await prisma.teamMember.findMany({
        orderBy: { order: 'asc' },
      });
      return res.status(200).json(members);
    }

    // /api/team (no path or empty)
    if (!firstSegment || firstSegment === '') {
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
    }

    // /api/team/:id
    const id = parseInt(firstSegment);
    if (!isNaN(id)) {
      if (req.method === 'GET') {
        const user = requireAdmin(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const member = await prisma.teamMember.findUnique({ where: { id } });
        if (!member) return res.status(404).json({ error: 'Not found' });
        return res.status(200).json(member);
      }

      if (req.method === 'PUT') {
        const user = requireAdmin(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const existing = await prisma.teamMember.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Not found' });

        const body = req.body;
        const member = await prisma.teamMember.update({
          where: { id },
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

      if (req.method === 'DELETE') {
        const user = requireAdmin(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const existing = await prisma.teamMember.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: 'Not found' });

        await prisma.teamMember.delete({ where: { id } });
        return res.status(204).end();
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Team API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
