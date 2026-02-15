import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try { await login({ username, password }); navigate('/admin'); }
    catch { setError('Невірний логін або пароль'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm"><BookOpen size={22} className="text-white" /></div>
          <h1 className="text-xl font-bold text-surface-800">Вхід в систему</h1>
          <p className="text-sm text-surface-600 mt-1">Чернівецька міська організація Профспілки працівників освіти і науки</p>
        </div>
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Логін</label>
              <input type="text" value={username} onChange={(e)=>setUsername(e.target.value)} required className="w-full px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="Введіть логін" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Пароль</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="w-full px-3.5 py-2.5 bg-white border border-surface-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors" placeholder="Введіть пароль" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50"><LogIn size={16} className="mr-2" />{loading ? 'Вхід...' : 'Увійти'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
