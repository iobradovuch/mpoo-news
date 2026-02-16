import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  try {
    if (req.method === 'GET') {
      const page = parseInt(req.query.page as string) || 0;
      const size = parseInt(req.query.size as string) || 20;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortDirection = (req.query.sortDirection as string) || 'DESC';

      const orderBy: Record<string, string> = {};
      orderBy[sortBy] = sortDirection.toLowerCase();

      const [documents, totalElements] = await Promise.all([
        prisma.document.findMany({
          orderBy,
          skip: page * size,
          take: size,
        }),
        prisma.document.count(),
      ]);

      const totalPages = Math.ceil(totalElements / size);

      return res.status(200).json({
        content: documents,
        totalPages,
        totalElements,
        number: page,
        size,
        first: page === 0,
        last: page >= totalPages - 1,
      });
    }

    if (req.method === 'POST') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const { title, fileUrl } = req.body;
      if (!title || !fileUrl) return res.status(400).json({ error: 'Title and fileUrl are required' });

      const document = await prisma.document.create({
        data: { title, fileUrl },
      });
      return res.status(200).json(document);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
