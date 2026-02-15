import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, FileText, Users, Tags, Plus } from 'lucide-react';
import apiService from '../../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ news: 0, docs: 0, team: 0, categories: 0 });

  useEffect(() => {
    Promise.all([
      apiService.getNews(0, 1).then(r => r.totalElements),
      apiService.getDocuments().then(r => r.length),
      apiService.getAllTeamMembersForAdmin().then(r => r.length),
      apiService.getCategories().then(r => r.length),
    ]).then(([news, docs, team, categories]) => setStats({ news, docs, team, categories })).catch(console.error);
  }, []);

  const cards = [
    { label: 'Новини', count: stats.news, icon: Newspaper, link: '/admin/news', color: 'bg-blue-50 text-blue-600' },
    { label: 'Документи', count: stats.docs, icon: FileText, link: '/admin/documents', color: 'bg-green-50 text-green-600' },
    { label: 'Команда', count: stats.team, icon: Users, link: '/admin/team', color: 'bg-purple-50 text-purple-600' },
    { label: 'Категорії', count: stats.categories, icon: Tags, link: '/admin/categories', color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Панель управління</h1>
        <Link to="/admin/news/create" className="btn-primary"><Plus size={18} className="mr-2" />Нова новина</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => (
          <Link key={c.label} to={c.link} className="card p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}><c.icon size={20} /></div>
            <p className="text-2xl font-bold text-gray-900">{c.count}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
