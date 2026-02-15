import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/api';
import type { News } from '../../types';
import { formatDateShort } from '../../lib/utils';

export default function NewsListPage() {
  const [news, setNews] = useState<News[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNews = () => {
    setLoading(true);
    apiService.getNews(page, 15).then(r => { setNews(r.content); setTotalPages(r.totalPages); }).finally(() => setLoading(false));
  };

  useEffect(fetchNews, [page]);

  const handleDelete = async (id: number) => {
    if (!confirm('Видалити цю новину?')) return;
    await apiService.deleteNews(id);
    fetchNews();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Новини</h1>
        <Link to="/admin/news/create" className="btn-primary"><Plus size={18} className="mr-2" />Створити</Link>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-3 font-medium">Заголовок</th><th className="text-left px-4 py-3 font-medium hidden md:table-cell">Категорія</th><th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Дата</th><th className="text-left px-4 py-3 font-medium">Статус</th><th className="text-right px-4 py-3 font-medium">Дії</th></tr></thead>
            <tbody>
              {loading ? (
                Array.from({length: 5}).map((_, i) => <tr key={i} className="border-b"><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
              ) : news.map(item => (
                <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{item.category?.name || '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{formatDateShort(item.createdAt)}</td>
                  <td className="px-4 py-3">{item.published ? <span className="inline-flex items-center gap-1 text-green-600"><Eye size={14}/>Опубл.</span> : <span className="inline-flex items-center gap-1 text-gray-400"><EyeOff size={14}/>Чернетка</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/admin/news/edit/${item.id}`} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-primary-500"><Edit size={16}/></Link>
                      <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({length: totalPages}).map((_, i) => (
            <button key={i} onClick={() => setPage(i)} className={`w-9 h-9 rounded-lg text-sm ${i === page ? 'bg-primary-500 text-white' : 'border hover:bg-gray-50'}`}>{i+1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
