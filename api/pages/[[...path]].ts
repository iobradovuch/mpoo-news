import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  const slug = pathSegments[0];

  if (!slug) return res.status(400).json({ error: 'Slug is required' });

  try {
    if (req.method === 'GET') {
      const page = await prisma.page.findUnique({ where: { slug } });
      if (!page) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(page);
    }

    if (req.method === 'PUT') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.page.findUnique({ where: { slug } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const { title, content } = req.body;

      const page = await prisma.page.update({
        where: { slug },
        data: { title, content },
      });

      return res.status(200).json(page);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Pages API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
