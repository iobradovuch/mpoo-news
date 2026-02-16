import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Determine upload type from URL
  const url = req.url || '';
  let folder = 'files';
  if (url.includes('/image') || url.includes('type=image')) {
    folder = 'images';
  } else if (url.includes('/document') || url.includes('type=document')) {
    folder = 'documents';
  }

  try {
    return handleUpload(req, res, folder);
  } catch (error) {
    console.error('Upload API error:', error);
    return res.status(500).json({ url: null, message: 'Помилка завантаження файлу' });
  }
}

async function handleUpload(
  req: VercelRequest,
  res: VercelResponse,
  folder: string
) {
  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const contentType = req.headers['content-type'] || '';
  const filename = (req.query.filename as string) || `${folder}-${Date.now()}`;
  const fileType = (req.query.type as string) || contentType.split(';')[0];

  // Collect body
  const chunks: Buffer[] = [];
  for await (const chunk of req as any) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const body = Buffer.concat(chunks);

  if (body.length > MAX_FILE_SIZE) {
    return res.status(400).json({ url: null, message: 'Файл занадто великий. Максимальний розмір: 10MB' });
  }

  // Extract file from multipart if needed
  let fileBuffer: Buffer = body;
  let actualFilename = filename;
  let fileContentType = fileType;

  if (contentType.includes('multipart/form-data')) {
    const boundary = contentType.split('boundary=')[1];
    if (boundary) {
      const parsed = parseMultipart(body, boundary);
      if (parsed) {
        fileBuffer = parsed.buffer;
        actualFilename = parsed.filename || filename;
        fileContentType = parsed.contentType || fileType;
      }
    }
  }

  // Upload to Vercel Blob
  const blob = await put(`${folder}/${Date.now()}-${actualFilename}`, fileBuffer, {
    access: 'public',
    contentType: fileContentType || 'application/octet-stream',
  });

  return res.status(200).json({
    url: blob.url,
    message: 'Файл успішно завантажено',
  });
}

function parseMultipart(body: Buffer, boundary: string): { buffer: Buffer; filename: string | null; contentType: string | null } | null {
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  const parts = splitBuffer(body, boundaryBuffer);

  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const header = part.subarray(0, headerEnd).toString();
    if (!header.includes('filename=')) continue;

    const filenameMatch = header.match(/filename="([^"]+)"/);
    const filename = filenameMatch ? filenameMatch[1] : null;

    const contentTypeMatch = header.match(/Content-Type:\s*(.+)/i);
    const contentType = contentTypeMatch ? contentTypeMatch[1].trim() : null;

    let content = part.subarray(headerEnd + 4);
    if (content.length >= 2 && content[content.length - 2] === 13 && content[content.length - 1] === 10) {
      content = content.subarray(0, content.length - 2);
    }

    return { buffer: content, filename, contentType };
  }

  return null;
}

function splitBuffer(buf: Buffer, delimiter: Buffer): Buffer[] {
  const parts: Buffer[] = [];
  let start = 0;

  while (start < buf.length) {
    const idx = buf.indexOf(delimiter, start);
    if (idx === -1) {
      parts.push(buf.subarray(start));
      break;
    }
    if (idx > start) {
      parts.push(buf.subarray(start, idx));
    }
    start = idx + delimiter.length;
  }

  return parts;
}
