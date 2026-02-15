import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import apiService from '../../services/api';
import type { Category } from '../../types';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [showNew, setShowNew] = useState(false);

  const fetch = () => apiService.getCategories().then(setCategories);
  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (editId) await apiService.updateCategory(editId, form);
    else await apiService.createCategory(form);
    setForm({ name: '', description: '' }); setEditId(null); setShowNew(false); fetch();
  };

  const handleDelete = async (id: number) => { if (confirm('Видалити?')) { await apiService.deleteCategory(id); fetch(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Категорії</h1><button onClick={() => { setShowNew(true); setEditId(null); setForm({ name: '', description: '' }); }} className="btn-primary"><Plus size={18} className="mr-2"/>Додати</button></div>
      {(showNew || editId) && (
        <div className="card p-5 mb-6 max-w-lg space-y-4">
          <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Назва" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/>
          <input value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Опис" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/>
          <div className="flex gap-2"><button onClick={handleSave} className="btn-primary"><Save size={16} className="mr-1"/>Зберегти</button><button onClick={() => { setShowNew(false); setEditId(null); }} className="btn-secondary"><X size={16} className="mr-1"/>Скасувати</button></div>
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-3 font-medium">Назва</th><th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Опис</th><th className="text-right px-4 py-3 font-medium">Дії</th></tr></thead>
          <tbody>{categories.map(c => (<tr key={c.id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.description}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button onClick={() => { setEditId(c.id); setForm({ name: c.name, description: c.description }); setShowNew(false); }} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><Edit size={16}/></button><button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button></div></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
