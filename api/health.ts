import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const envCheck = {
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasPostgresUrlUnpooled: !!process.env.POSTGRES_URL_UNPOOLED,
    hasPostgresPrismaUrl: !!process.env.POSTGRES_PRISMA_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN,
    nodeEnv: process.env.NODE_ENV,
    // List all POSTGRES* env var names (not values)
    postgresEnvKeys: Object.keys(process.env).filter(k => k.startsWith('POSTGRES') || k.startsWith('DATABASE') || k.startsWith('PG')),
  };

  let dbStatus = 'not tested';
  try {
    const { prisma } = await import('./_lib/db');
    const count = await prisma.user.count();
    dbStatus = `connected, ${count} users`;
  } catch (error: any) {
    dbStatus = `error: ${error.message}`;
  }

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: envCheck,
    db: dbStatus,
  });
}
