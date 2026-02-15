import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function getImageUrl(url?: string): string {
  if (!url) return '/placeholder.svg';
  if (url.startsWith('http')) return url;
  // Uploads are served directly, not through /api prefix
  if (url.startsWith('/uploads/')) return url;
  // URLs starting with /api/ are already absolute paths — return as-is
  if (url.startsWith('/api/')) return url;
  const baseUrl = import.meta.env.VITE_API_URL || '';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function generateReadingTime(content: string): number {
  const text = stripHtml(content);
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
