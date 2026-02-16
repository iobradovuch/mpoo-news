import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as cheerio from 'cheerio';
import { prisma } from '../_lib/db';
import { requireAdmin } from '../_lib/auth';
import { handleCors } from '../_lib/cors';

const SOURCE_URL = 'https://pon.org.ua/novyny/';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ExternalNews {
  title: string;
  content: string;
  imageUrl?: string;
  sourceUrl?: string;
  publishedDate?: string;
  imageUrls?: string[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  const user = requireAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const url = req.url || '';

  try {
    // GET /api/news-import/scrape
    if (url.includes('/scrape') || req.query.action === 'scrape') {
      if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
      return handleScrape(req, res);
    }

    // POST /api/news-import/import-selected
    if (url.includes('/import') || req.query.action === 'import') {
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
      return handleImport(req, res);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    console.error('News import error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleScrape(_req: VercelRequest, res: VercelResponse) {
  try {
    // Fetch news list page
    const response = await fetch(SOURCE_URL, {
      headers: { 'User-Agent': USER_AGENT },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `Failed to fetch pon.org.ua: ${response.status}` });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract news links
    const newsLinks: { url: string; previewTitle: string; previewImage?: string }[] = [];

    $('div#news .ntitle a, #news .ntitle a').each((_i, el) => {
      if (newsLinks.length >= 10) return false;
      const $el = $(el);
      let href = $el.attr('href') || '';
      if (!href) return;
      if (!href.startsWith('http')) {
        href = 'https://pon.org.ua' + (href.startsWith('/') ? '' : '/') + href;
      }
      const title = $el.text().trim();
      // Try to get preview image from parent
      const $parent = $el.closest('.nblock, .news-block, .newsblock, div');
      const previewImg = $parent.find('img').first().attr('src') || '';
      let previewImage: string | undefined;
      if (previewImg) {
        previewImage = previewImg.startsWith('http') ? previewImg : 'https://pon.org.ua' + (previewImg.startsWith('/') ? '' : '/') + previewImg;
      }
      newsLinks.push({ url: href, previewTitle: title, previewImage });
    });

    // If primary selector didn't work, try alternative selectors
    if (newsLinks.length === 0) {
      $('article a, .post-title a, .entry-title a, .news-item a, .story a').each((_i, el) => {
        if (newsLinks.length >= 10) return false;
        const $el = $(el);
        let href = $el.attr('href') || '';
        if (!href || href === '#') return;
        if (!href.startsWith('http')) {
          href = 'https://pon.org.ua' + (href.startsWith('/') ? '' : '/') + href;
        }
        // Skip non-article links
        if (!href.includes('pon.org.ua')) return;
        const title = $el.text().trim();
        if (!title || title.length < 10) return;
        // Avoid duplicates
        if (newsLinks.some(n => n.url === href)) return;
        newsLinks.push({ url: href, previewTitle: title });
      });
    }

    // Check which URLs are already imported
    const existingUrls = await prisma.news.findMany({
      where: { sourceUrl: { in: newsLinks.map(n => n.url) } },
      select: { sourceUrl: true },
    });
    const existingUrlSet = new Set(existingUrls.map(n => n.sourceUrl));

    // Fetch full articles
    const results: ExternalNews[] = [];

    for (const link of newsLinks) {
      if (existingUrlSet.has(link.url)) continue;

      try {
        const article = await fetchArticle(link.url, link.previewImage);
        if (article) {
          results.push(article);
        }
      } catch (err) {
        console.error(`Failed to fetch article: ${link.url}`, err);
        // Still add with preview data
        results.push({
          title: link.previewTitle,
          content: '',
          imageUrl: link.previewImage,
          sourceUrl: link.url,
        });
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Failed to scrape news' });
  }
}

async function fetchArticle(url: string, previewImage?: string): Promise<ExternalNews | null> {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });

  if (!response.ok) return null;

  const html = await response.text();
  const $ = cheerio.load(html);

  // Extract title
  const title = $('h1').first().text().trim()
    || $('.post-title').first().text().trim()
    || $('.entry-title').first().text().trim()
    || $('article h1').first().text().trim()
    || '';

  if (!title) return null;

  // Extract date
  let publishedDate: string | undefined;
  const dateEl = $('time, .post-date, .entry-date, .published, .date').first();
  if (dateEl.length) {
    publishedDate = dateEl.attr('datetime') || dateEl.text().trim();
  }

  // Extract main image
  let mainImage = previewImage;
  const $fullstory = $('.fullstory, .full-story, .post-content, .entry-content, article');
  if (!mainImage) {
    const firstImg = $fullstory.find('img').first();
    let imgSrc = firstImg.attr('src') || '';
    if (imgSrc && !imgSrc.startsWith('http')) {
      imgSrc = 'https://pon.org.ua' + (imgSrc.startsWith('/') ? '' : '/') + imgSrc;
    }
    if (imgSrc) mainImage = imgSrc;
  }

  // Extract gallery images
  const imageUrls: string[] = [];
  $fullstory.find('img').each((_i, el) => {
    let src = $(el).attr('src') || '';
    if (!src) return;
    if (!src.startsWith('http')) {
      src = 'https://pon.org.ua' + (src.startsWith('/') ? '' : '/') + src;
    }
    // Skip small images and duplicates
    const width = parseInt($(el).attr('width') || '100');
    const height = parseInt($(el).attr('height') || '100');
    if (width < 50 || height < 50) return;
    if (src === mainImage) return;
    if (!imageUrls.includes(src)) {
      imageUrls.push(src);
    }
  });

  // Extract content as markdown
  const content = htmlToMarkdown($, $fullstory);

  return {
    title,
    content,
    imageUrl: mainImage,
    sourceUrl: url,
    publishedDate,
    imageUrls,
  };
}

function htmlToMarkdown($: cheerio.CheerioAPI, $container: cheerio.Cheerio<any>): string {
  let markdown = '';

  $container.children().each((_i, el) => {
    const $el = $(el);
    const tagName = (el as any).tagName?.toLowerCase() || '';

    if (tagName === 'p') {
      const text = processInline($, $el);
      if (text.trim()) {
        markdown += text.trim() + '\n\n';
      }
    } else if (/^h[1-6]$/.test(tagName)) {
      const level = parseInt(tagName[1]);
      const text = $el.text().trim();
      if (text) {
        markdown += '#'.repeat(level) + ' ' + text + '\n\n';
      }
    } else if (tagName === 'ul' || tagName === 'ol') {
      $el.find('li').each((j, li) => {
        const prefix = tagName === 'ol' ? `${j + 1}. ` : '- ';
        markdown += prefix + $(li).text().trim() + '\n';
      });
      markdown += '\n';
    } else if (tagName === 'blockquote') {
      const text = $el.text().trim();
      if (text) {
        markdown += '> ' + text.replace(/\n/g, '\n> ') + '\n\n';
      }
    } else if (tagName === 'img') {
      // Skip standalone images (already extracted to imageUrls)
    } else if (tagName === 'div' || tagName === 'section') {
      // Recurse into divs
      const inner = htmlToMarkdown($, $el);
      if (inner.trim()) {
        markdown += inner;
      }
    } else if (tagName === 'br') {
      markdown += '\n';
    } else {
      const text = processInline($, $el);
      if (text.trim()) {
        markdown += text.trim() + '\n\n';
      }
    }
  });

  // Remove ALL image references from markdown (they are already in imageUrls)
  markdown = markdown.replace(/!\[.*?\]\(.*?\)\s*/g, '');

  // Normalize blank lines
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

  return markdown;
}

function processInline($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string {
  let result = '';

  $el.contents().each((_i, node) => {
    if (node.type === 'text') {
      result += (node as any).data || '';
    } else if (node.type === 'tag') {
      const $node = $(node);
      const tag = (node as any).tagName?.toLowerCase() || '';

      if (tag === 'a') {
        let href = $node.attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = 'https://pon.org.ua' + (href.startsWith('/') ? '' : '/') + href;
        }
        const text = $node.text().trim();
        result += `[${text}](${href})`;
      } else if (tag === 'strong' || tag === 'b') {
        result += `**${$node.text().trim()}**`;
      } else if (tag === 'em' || tag === 'i') {
        result += `*${$node.text().trim()}*`;
      } else if (tag === 'img') {
        let src = $node.attr('src') || '';
        if (src && !src.startsWith('http')) {
          src = 'https://pon.org.ua' + (src.startsWith('/') ? '' : '/') + src;
        }
        const alt = $node.attr('alt') || '';
        result += `![${alt}](${src})`;
      } else if (tag === 'br') {
        result += '\n';
      } else {
        result += $node.text();
      }
    }
  });

  return result;
}

async function handleImport(req: VercelRequest, res: VercelResponse) {
  const selectedNews: ExternalNews[] = req.body;

  if (!Array.isArray(selectedNews) || selectedNews.length === 0) {
    return res.status(400).json({ success: false, importedCount: 0, message: 'Не обрано жодної новини' });
  }

  // Get default category "Новини"
  let defaultCategory = await prisma.category.findFirst({ where: { name: 'Новини' } });
  if (!defaultCategory) {
    defaultCategory = await prisma.category.create({ data: { name: 'Новини', description: 'Новини' } });
  }

  let importedCount = 0;
  const errors: string[] = [];

  for (const news of selectedNews) {
    try {
      // Check for duplicate by sourceUrl
      if (news.sourceUrl) {
        const existing = await prisma.news.findFirst({ where: { sourceUrl: news.sourceUrl } });
        if (existing) {
          errors.push(`Дублікат: ${news.title}`);
          continue;
        }
      }

      // Check for duplicate by title
      const existingByTitle = await prisma.news.findFirst({ where: { title: news.title } });
      if (existingByTitle) {
        errors.push(`Дублікат (за назвою): ${news.title}`);
        continue;
      }

      // Convert markdown to HTML
      const htmlContent = markdownToHtml(news.content);

      // Generate summary
      const plainText = news.content.replace(/[#*\[\]()!>-]/g, '').replace(/\n+/g, ' ').trim();
      const summary = plainText.length > 200 ? plainText.substring(0, 197) + '...' : plainText;

      // Parse date
      let publishedDate: Date | null = null;
      if (news.publishedDate) {
        publishedDate = parseDate(news.publishedDate);
      }
      if (!publishedDate) {
        publishedDate = new Date();
      }

      // Create news entry
      await prisma.news.create({
        data: {
          title: news.title,
          summary,
          content: htmlContent,
          categoryId: defaultCategory.id,
          published: true,
          publishedDate,
          mainImageUrl: news.imageUrl || null,
          sourceUrl: news.sourceUrl || null,
          images: news.imageUrls?.length
            ? { create: news.imageUrls.map(url => ({ imageUrl: url })) }
            : undefined,
        },
      });

      importedCount++;
    } catch (err) {
      console.error(`Failed to import: ${news.title}`, err);
      errors.push(`Помилка: ${news.title}`);
    }
  }

  const message = importedCount > 0
    ? `Успішно імпортовано ${importedCount} ${getNewsWord(importedCount)}${errors.length > 0 ? `. Пропущено: ${errors.length}` : ''}`
    : `Не вдалося імпортувати жодної новини. ${errors.join('; ')}`;

  return res.status(200).json({
    success: importedCount > 0,
    importedCount,
    message,
  });
}

function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Lists
  const lines = html.split('\n');
  let result = '';
  let inList = false;
  let listType = '';

  for (const line of lines) {
    const ulMatch = line.match(/^- (.+)/);
    const olMatch = line.match(/^\d+\. (.+)/);

    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) result += `</${listType}>`;
        result += '<ul>';
        inList = true;
        listType = 'ul';
      }
      result += `<li>${ulMatch[1]}</li>`;
    } else if (olMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result += `</${listType}>`;
        result += '<ol>';
        inList = true;
        listType = 'ol';
      }
      result += `<li>${olMatch[1]}</li>`;
    } else {
      if (inList) {
        result += `</${listType}>`;
        inList = false;
      }
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('<h') && !trimmed.startsWith('<img') && !trimmed.startsWith('<')) {
        result += `<p>${trimmed}</p>`;
      } else if (trimmed) {
        result += trimmed;
      }
    }
  }

  if (inList) result += `</${listType}>`;

  return result;
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) return isoDate;

  // Try dd.MM.yyyy format
  const dotMatch = dateStr.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (dotMatch) {
    return new Date(parseInt(dotMatch[3]), parseInt(dotMatch[2]) - 1, parseInt(dotMatch[1]));
  }

  // Try Ukrainian date format "dd місяць yyyy"
  const ukMonths: Record<string, number> = {
    'січня': 0, 'лютого': 1, 'березня': 2, 'квітня': 3, 'травня': 4, 'червня': 5,
    'липня': 6, 'серпня': 7, 'вересня': 8, 'жовтня': 9, 'листопада': 10, 'грудня': 11,
  };

  for (const [month, idx] of Object.entries(ukMonths)) {
    if (dateStr.toLowerCase().includes(month)) {
      const dayMatch = dateStr.match(/(\d{1,2})/);
      const yearMatch = dateStr.match(/(\d{4})/);
      if (dayMatch && yearMatch) {
        return new Date(parseInt(yearMatch[1]), idx, parseInt(dayMatch[1]));
      }
    }
  }

  return null;
}

function getNewsWord(count: number): string {
  if (count === 1) return 'новину';
  if (count >= 2 && count <= 4) return 'новини';
  return 'новин';
}
