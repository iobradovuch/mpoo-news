import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

  try {
    if (req.method === 'GET') {
      const document = await prisma.document.findUnique({ where: { id } });
      if (!document) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(document);
    }

    if (req.method === 'DELETE') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.document.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      await prisma.document.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
