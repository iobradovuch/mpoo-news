import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Newspaper, FileText, Users, Tags,
  Download, LogOut, Menu, BookOpen, ChevronRight,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Панель управління', icon: LayoutDashboard, end: true },
  { to: '/admin/news', label: 'Новини', icon: Newspaper },
  { to: '/admin/categories', label: 'Категорії', icon: Tags },
  { to: '/admin/documents', label: 'Документи', icon: FileText },
  { to: '/admin/team', label: 'Команда', icon: Users },
  { to: '/admin/news/import', label: 'Імпорт новин', icon: Download },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={18} />
              </div>
              <span className="font-bold text-primary-500 text-sm">Адмін-панель</span>
            </Link>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <link.icon size={18} />
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-200">
            <div className="px-3 py-2 text-sm text-gray-500 mb-1">{username}</div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut size={18} />
              Вийти
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-500 flex items-center gap-1">
            На сайт <ChevronRight size={14} />
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
