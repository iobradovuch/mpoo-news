import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { handleCors } from '../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(documents);
  } catch (error) {
    console.error('Documents API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
