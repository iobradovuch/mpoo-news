import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const idStr = pathSegments[0];

  try {
    // /api/categories (no id)
    if (!idStr || idStr === '') {
      if (req.method === 'GET') {
        const categories = await prisma.category.findMany();
        return res.status(200).json(categories);
      }

      if (req.method === 'POST') {
        const user = requireAdmin(req);
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const existing = await prisma.category.findFirst({ where: { name } });
        if (existing) return res.status(400).json({ error: `Категорія з назвою '${name}' вже існує` });

        const category = await prisma.category.create({
          data: { name, description: description || null },
        });
        return res.status(200).json(category);
      }

      return res.status(405).json({ error: 'Method not allowed' });
    }

    // /api/categories/:id
    const id = parseInt(idStr);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    if (req.method === 'PUT') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const { name, description } = req.body;

      if (name !== existing.name) {
        const duplicate = await prisma.category.findFirst({ where: { name } });
        if (duplicate) return res.status(400).json({ error: `Категорія з назвою '${name}' вже існує` });
      }

      const category = await prisma.category.update({
        where: { id },
        data: { name, description: description || null },
      });
      return res.status(200).json(category);
    }

    if (req.method === 'DELETE') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      await prisma.category.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
