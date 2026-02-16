import { useState } from 'react';
import { Download, ArrowRight, Check, CheckSquare, Square, Search, Loader2 } from 'lucide-react';
import apiService from '../../services/api';
import type { ExternalNews } from '../../types';

function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')       // images ![alt](url)
    .replace(/\[([^\]]*)\]\(.*?\)/g, '$1') // links [text](url) → text
    .replace(/#{1,6}\s/g, '')              // headers
    .replace(/\*\*(.+?)\*\*/g, '$1')      // bold
    .replace(/\*(.+?)\*/g, '$1')          // italic
    .replace(/^\s*[-*]\s/gm, '')           // list markers
    .replace(/^\s*\d+\.\s/gm, '')         // numbered lists
    .replace(/>\s?/g, '')                  // blockquotes
    .replace(/\n{2,}/g, ' ')              // collapse newlines
    .trim();
}

export default function NewsImportPage() {
  const [news, setNews] = useState<ExternalNews[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);
    setSelected(new Set());
    try {
      const data = await apiService.scrapeExternalNews();
      setNews(data);
    } catch (e) {
      console.error(e);
      setResult({ success: false, message: 'Помилка при скануванні новин' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === news.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(news.map((_, i) => i)));
    }
  };

  const handleImportSelected = async () => {
    if (selected.size === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const selectedNews = Array.from(selected).map((i) => news[i]);
      const res = await apiService.importSelectedNews(selectedNews);
      setResult({ success: res.success, message: res.message });
      // Remove imported news from list
      if (res.importedCount > 0) {
        const remaining = news.filter((_, i) => !selected.has(i));
        setNews(remaining);
        setSelected(new Set());
      }
    } catch (e) {
      console.error(e);
      setResult({ success: false, message: 'Помилка при імпорті новин' });
    } finally {
      setImporting(false);
    }
  };

  const allSelected = news.length > 0 && selected.size === news.length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Імпорт новин</h1>
          <p className="text-sm text-gray-500 mt-1">
            Сканування та імпорт новин з pon.org.ua
          </p>
        </div>
        <button
          onClick={handleScrape}
          disabled={loading}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? (
            <Loader2 size={18} className="mr-2 animate-spin" />
          ) : (
            <Search size={18} className="mr-2" />
          )}
          {loading ? 'Сканування...' : 'Сканувати'}
        </button>
      </div>

      {/* Result message */}
      {result && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            result.success
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {result.message}
        </div>
      )}

      {/* News list */}
      {news.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAll}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {allSelected ? (
                  <CheckSquare size={18} className="text-primary-500" />
                ) : (
                  <Square size={18} />
                )}
                {allSelected ? 'Зняти все' : 'Обрати все'}
              </button>
              <span className="text-sm text-gray-400">
                Обрано: {selected.size} з {news.length}
              </span>
            </div>
            <button
              onClick={handleImportSelected}
              disabled={selected.size === 0 || importing}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selected.size > 0
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {importing ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Download size={16} className="mr-2" />
              )}
              {importing
                ? 'Імпортування...'
                : `Імпортувати обрані (${selected.size})`}
            </button>
          </div>

          {/* News cards */}
          <div className="space-y-3">
            {news.map((n, i) => {
              const isSelected = selected.has(i);
              return (
                <div
                  key={i}
                  onClick={() => toggleSelect(i)}
                  className={`card p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-primary-500 bg-primary-50/30'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Checkbox */}
                    <div className="flex-shrink-0 pt-0.5">
                      {isSelected ? (
                        <div className="w-5 h-5 bg-primary-500 rounded flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded" />
                      )}
                    </div>

                    {/* Image */}
                    {n.imageUrl && (
                      <div className="flex-shrink-0 hidden sm:block">
                        <img
                          src={n.imageUrl}
                          alt=""
                          className="w-20 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {n.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {n.content ? stripMarkdown(n.content).substring(0, 200) + '...' : ''}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {n.publishedDate && (
                          <span>{n.publishedDate}</span>
                        )}
                        {n.sourceUrl && (
                          <a
                            href={n.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-500 hover:underline flex items-center gap-1"
                          >
                            Джерело <ArrowRight size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && news.length === 0 && !result && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Download size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">
            Натисніть "Сканувати"
          </h3>
          <p className="text-sm text-gray-400">
            для пошуку нових новин з зовнішніх джерел
          </p>
        </div>
      )}
    </div>
  );
}
