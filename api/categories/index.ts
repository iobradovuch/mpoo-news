import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
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
  } catch (error) {
    console.error('Categories API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
