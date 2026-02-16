import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : req.query.path ? [req.query.path] : [];
  const firstSegment = pathSegments[0];

  try {
    // /api/documents/all
    if (firstSegment === 'all' && req.method === 'GET') {
      const documents = await prisma.document.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(documents);
    }

    // /api/documents (no path or empty)
    if (!firstSegment || firstSegment === '') {
      if (req.method === 'GET') {
        return handleGetPaginated(req, res);
      }
      if (req.method === 'POST') {
        return handleCreate(req, res);
      }
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // /api/documents/:id
    const id = parseInt(firstSegment);
    if (!isNaN(id)) {
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
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('Documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetPaginated(req: VercelRequest, res: VercelResponse) {
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

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, fileUrl } = req.body;

  if (!title || !fileUrl) {
    return res.status(400).json({ error: 'Title and fileUrl are required' });
  }

  const document = await prisma.document.create({
    data: { title, fileUrl },
  });

  return res.status(200).json(document);
}
