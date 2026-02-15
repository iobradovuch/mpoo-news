import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import apiService from '../services/api';
import type { News, Category } from '../types';
import { formatDate, truncateText, stripHtml, getImageUrl } from '../lib/utils';
import { useDebounce } from '../hooks/useDebounce';

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '0');
  const categoryId = searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined;
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    apiService.getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    apiService.getNews(page, 9, categoryId, debouncedSearch || undefined)
      .then((res) => { setNews(res.content); setTotalPages(res.totalPages); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, categoryId, debouncedSearch]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => { if (v) params.set(k, v); else params.delete(k); });
    setSearchParams(params);
  };

  return (
    <div>
      <div className="bg-white border-b border-surface-200">
        <div className="container-page py-8">
          <h1 className="text-3xl font-bold text-surface-800">Новини</h1>
          <p className="text-surface-600 mt-1">Актуальна інформація та події організації</p>
        </div>
      </div>

      <div className="bg-white border-b border-surface-200">
        <div className="container-page py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500" />
              <input
                type="text"
                placeholder="Пошук новин..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); updateParams({ page: undefined, q: e.target.value || undefined }); }}
                className="w-full pl-10 pr-4 py-2 bg-surface-100 border border-surface-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => updateParams({ category: undefined, page: undefined })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${!categoryId ? 'bg-brand-600 text-white shadow-sm' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
              >Усі</button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParams({ category: String(c.id), page: undefined })}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryId === c.id ? 'bg-brand-600 text-white shadow-sm' : 'bg-surface-100 text-surface-700 hover:bg-surface-200'}`}
                >{c.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse card p-0">
                <div className="bg-surface-200 h-52" />
                <div className="p-5"><div className="bg-surface-200 h-4 rounded w-1/4 mb-3" /><div className="bg-surface-200 h-5 rounded w-3/4 mb-2" /><div className="bg-surface-200 h-4 rounded w-full" /></div>
              </div>
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="py-20 text-center">
            <FileText size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-700 font-medium text-lg">Новин не знайдено</p>
            <p className="text-sm text-surface-500 mt-1">Спробуйте змінити параметри пошуку</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <Link key={item.id} to={`/news/${item.id}`} className="card-hover group flex flex-col">
                <div className="aspect-[16/10] bg-surface-200 overflow-hidden">
                  {item.mainImageUrl ? (
                    <img src={getImageUrl(item.mainImageUrl)} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileText size={36} className="text-surface-400" /></div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    {item.category && <span className="badge text-[10px]">{item.category.name}</span>}
                    <span className="text-xs text-surface-500">{formatDate(item.publishedDate || item.createdAt)}</span>
                  </div>
                  <h3 className="font-semibold text-surface-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">{item.title}</h3>
                  <p className="text-sm text-surface-600 line-clamp-2 flex-1">{truncateText(stripHtml(item.summary || item.content), 130)}</p>
                  <div className="mt-4 pt-3 border-t border-surface-100 flex items-center text-sm font-medium text-brand-600">Читати далі <ChevronRight size={14} className="ml-1" /></div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-10">
            <button onClick={() => updateParams({ page: String(page - 1) })} disabled={page === 0} className="p-2 rounded-lg border border-surface-200 bg-white disabled:opacity-30 hover:bg-surface-50 transition-colors shadow-sm"><ChevronLeft size={16} /></button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button key={i} onClick={() => updateParams({ page: String(i) })} className={`w-9 h-9 rounded-lg text-sm font-medium transition-all shadow-sm ${i === page ? 'bg-brand-600 text-white' : 'bg-white border border-surface-200 text-surface-700 hover:bg-surface-50'}`}>{i + 1}</button>
            ))}
            <button onClick={() => updateParams({ page: String(page + 1) })} disabled={page >= totalPages - 1} className="p-2 rounded-lg border border-surface-200 bg-white disabled:opacity-30 hover:bg-surface-50 transition-colors shadow-sm"><ChevronRight size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
