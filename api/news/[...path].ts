import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';
import type { Prisma } from '@prisma/client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  const idOrAction = pathSegments[0];

  try {
    // /api/news (no path segments or empty)
    if (!idOrAction || idOrAction === '') {
      if (req.method === 'GET') return handleGetNews(req, res);
      if (req.method === 'POST') return handleCreateNews(req, res);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // /api/news/:id
    const id = parseInt(idOrAction);
    if (!isNaN(id)) {
      switch (req.method) {
        case 'GET': return handleGetOne(id, res);
        case 'PUT': return handleUpdate(id, req, res);
        case 'DELETE': return handleDelete(id, req, res);
        default: return res.status(405).json({ error: 'Method not allowed' });
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('News API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetNews(req: VercelRequest, res: VercelResponse) {
  const page = parseInt(req.query.page as string) || 0;
  const size = parseInt(req.query.size as string) || 10;
  const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
  const keyword = req.query.keyword as string | undefined;

  const where: Prisma.NewsWhereInput = { published: true };

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (keyword && keyword.trim()) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { summary: { contains: keyword, mode: 'insensitive' } },
      { content: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const [news, totalElements] = await Promise.all([
    prisma.news.findMany({
      where,
      include: { category: true, images: true },
      orderBy: { publishedDate: 'desc' },
      skip: page * size,
      take: size,
    }),
    prisma.news.count({ where }),
  ]);

  const totalPages = Math.ceil(totalElements / size);

  return res.status(200).json({
    content: news.map(transformNews),
    totalPages,
    totalElements,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
  });
}

async function handleCreateNews(req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { title, summary, content, category, published, publishedDate, mainImageUrl, imageUrls } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  let finalPublishedDate: Date | null = null;
  if (publishedDate) {
    finalPublishedDate = new Date(publishedDate);
  } else if (published) {
    finalPublishedDate = new Date();
  }

  const categoryId = category?.id || null;

  const news = await prisma.news.create({
    data: {
      title,
      summary: summary || null,
      content,
      categoryId,
      published: published || false,
      publishedDate: finalPublishedDate,
      mainImageUrl: mainImageUrl || null,
      images: imageUrls?.length
        ? { create: imageUrls.map((url: string) => ({ imageUrl: url })) }
        : undefined,
    },
    include: { category: true, images: true },
  });

  return res.status(200).json(transformNews(news));
}

async function handleGetOne(id: number, res: VercelResponse) {
  const news = await prisma.news.findFirst({
    where: { id, published: true },
    include: { category: true, images: true },
  });

  if (!news) return res.status(404).json({ error: 'Not found' });
  return res.status(200).json(transformNews(news));
}

async function handleUpdate(id: number, req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { title, summary, content, category, published, publishedDate, mainImageUrl, imageUrls } = req.body;

  let finalPublishedDate: Date | null = existing.publishedDate;
  if (publishedDate) {
    finalPublishedDate = new Date(publishedDate);
  } else if (published && !existing.publishedDate) {
    finalPublishedDate = new Date();
  } else if (!published) {
    finalPublishedDate = null;
  }

  const categoryId = category?.id || null;

  await prisma.newsImage.deleteMany({ where: { newsId: id } });

  const news = await prisma.news.update({
    where: { id },
    data: {
      title,
      summary: summary || null,
      content,
      categoryId,
      published: published || false,
      publishedDate: finalPublishedDate,
      mainImageUrl: mainImageUrl || null,
      images: imageUrls?.length
        ? { create: imageUrls.map((url: string) => ({ imageUrl: url })) }
        : undefined,
    },
    include: { category: true, images: true },
  });

  return res.status(200).json(transformNews(news));
}

async function handleDelete(id: number, req: VercelRequest, res: VercelResponse) {
  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const existing = await prisma.news.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  await prisma.news.delete({ where: { id } });
  return res.status(204).end();
}

function transformNews(news: any) {
  return {
    id: news.id,
    title: news.title,
    summary: news.summary,
    content: news.content,
    category: news.category,
    createdAt: news.createdAt,
    updatedAt: news.updatedAt,
    published: news.published,
    publishedDate: news.publishedDate,
    mainImageUrl: news.mainImageUrl,
    sourceUrl: news.sourceUrl,
    imageUrls: news.images?.map((img: any) => img.imageUrl) || [],
  };
}
