import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleCors } from '../../_lib/cors';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This route handles legacy /api/upload/files/:subDir/:filename URLs
  // With Vercel Blob, files are served directly from their Blob URLs
  // This route exists for backwards compatibility
  const path = req.query.path;
  const pathStr = Array.isArray(path) ? path.join('/') : path;

  if (!pathStr) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Files uploaded to Vercel Blob are served directly from blob URLs
  // This endpoint returns 404 for legacy file paths
  // Frontend should already be using the Blob URLs returned from upload
  return res.status(404).json({
    error: 'File not found. Files are now served from Vercel Blob storage. Use the URL returned from the upload API.',
  });
}
