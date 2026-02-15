import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import apiService from '../services/api';
import type { News } from '../types';
import { formatDate, getImageUrl } from '../lib/utils';
import ImageLightbox from '../components/ImageLightbox';

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    apiService.getNewsById(parseInt(id)).then(setNews).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="container-page py-12">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-4 bg-surface-200 rounded w-20 mb-8" />
        <div className="h-8 bg-surface-200 rounded w-2/3 mb-4" />
        <div className="h-4 bg-surface-200 rounded w-1/4 mb-8" />
        <div className="h-80 bg-surface-200 rounded-card-lg mb-8" />
        <div className="space-y-3">{[1,2,3,4].map(i=><div key={i} className="h-4 bg-surface-200 rounded"/>)}</div>
      </div>
    </div>
  );

  if (!news) return (
    <div className="container-page py-20 text-center">
      <p className="text-surface-600 text-lg font-medium mb-4">Новину не знайдено</p>
      <Link to="/news" className="btn-primary">До новин</Link>
    </div>
  );

  // NOTE: dangerouslySetInnerHTML is used here intentionally for rendering
  // trusted HTML content from our own backend CMS. The content is generated
  // by our admin panel's rich text editor and markdown-to-HTML converter,
  // not from arbitrary user input.
  return (
    <div className="bg-white">
      <div className="container-page py-8">
        <div className="max-w-4xl mx-auto">
          <Link to="/news" className="inline-flex items-center gap-2 text-surface-600 hover:text-surface-800 text-sm font-medium transition-colors mb-8">
            <ArrowLeft size={16} /> Назад до новин
          </Link>
          <div className="mb-6">
            {news.category && <span className="badge mb-3 inline-flex items-center gap-1"><Tag size={10} /> {news.category.name}</span>}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-surface-800 leading-tight mb-4">{news.title}</h1>
            <div className="flex items-center gap-2 text-sm text-surface-500"><Calendar size={14} />{formatDate(news.publishedDate || news.createdAt)}</div>
          </div>
          {news.mainImageUrl && (
            <div className="rounded-card-lg overflow-hidden shadow-card mb-8">
              <img src={getImageUrl(news.mainImageUrl)} alt={news.title} className="w-full object-cover max-h-[500px]" />
            </div>
          )}
          <div
            className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-surface-800 prose-headings:font-bold prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-card-lg prose-img:shadow-card prose-img:max-w-full"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
          {news.imageUrls && news.imageUrls.length > 0 && (
            <div className="mt-12 pt-8 border-t border-surface-200">
              <h3 className="text-lg font-semibold text-surface-800 mb-4">Фотогалерея</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {news.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className="overflow-hidden rounded-card-lg shadow-card hover:shadow-card-hover transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 cursor-pointer"
                  >
                    <img
                      src={getImageUrl(url)}
                      alt=""
                      className="object-cover aspect-video w-full"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && news.imageUrls && news.imageUrls.length > 0 && (
        <ImageLightbox
          images={news.imageUrls}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
