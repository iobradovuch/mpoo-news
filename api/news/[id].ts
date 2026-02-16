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
      const news = await prisma.news.findFirst({
        where: { id, published: true },
        include: { category: true, images: true },
      });
      if (!news) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(transformNews(news));
    }

    if (req.method === 'PUT') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.news.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      const { title, summary, content, category, published, publishedDate, mainImageUrl, imageUrls } = req.body;

      let finalPublishedDate: Date | null = existing.publishedDate;
      if (publishedDate) finalPublishedDate = new Date(publishedDate);
      else if (published && !existing.publishedDate) finalPublishedDate = new Date();
      else if (!published) finalPublishedDate = null;

      await prisma.newsImage.deleteMany({ where: { newsId: id } });

      const news = await prisma.news.update({
        where: { id },
        data: {
          title, summary: summary || null, content,
          categoryId: category?.id || null,
          published: published || false, publishedDate: finalPublishedDate,
          mainImageUrl: mainImageUrl || null,
          images: imageUrls?.length ? { create: imageUrls.map((url: string) => ({ imageUrl: url })) } : undefined,
        },
        include: { category: true, images: true },
      });
      return res.status(200).json(transformNews(news));
    }

    if (req.method === 'DELETE') {
      const user = requireAdmin(req);
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const existing = await prisma.news.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ error: 'Not found' });

      await prisma.news.delete({ where: { id } });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function transformNews(news: any) {
  return {
    id: news.id, title: news.title, summary: news.summary, content: news.content,
    category: news.category, createdAt: news.createdAt, updatedAt: news.updatedAt,
    published: news.published, publishedDate: news.publishedDate,
    mainImageUrl: news.mainImageUrl, sourceUrl: news.sourceUrl,
    imageUrls: news.images?.map((img: any) => img.imageUrl) || [],
  };
}
