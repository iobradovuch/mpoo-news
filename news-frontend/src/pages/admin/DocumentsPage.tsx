import { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, FileText } from 'lucide-react';
import apiService from '../../services/api';
import type { Document } from '../../types';
import { formatDateShort } from '../../lib/utils';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetch = () => apiService.getDocuments().then(setDocs);
  useEffect(() => { fetch(); }, []);

  const handleUpload = async () => {
    if (!file || !title) return;
    setUploading(true);
    try { const url = await apiService.uploadDocument(file); await apiService.createDocument({ title, fileUrl: url }); setTitle(''); setFile(null); setShowNew(false); fetch(); } catch (e) { console.error(e); } finally { setUploading(false); }
  };

  const handleDelete = async (id: number) => { if (confirm('Видалити?')) { await apiService.deleteDocument(id); fetch(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Документи</h1><button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={18} className="mr-2"/>Додати</button></div>
      {showNew && (
        <div className="card p-5 mb-6 max-w-lg space-y-4">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Назва документа" className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/>
          <label className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm cursor-pointer hover:bg-gray-50"><Upload size={16}/>{file ? file.name : 'Обрати файл'}<input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden"/></label>
          <div className="flex gap-2"><button onClick={handleUpload} disabled={uploading} className="btn-primary">{uploading ? 'Завантаження...' : 'Зберегти'}</button><button onClick={() => setShowNew(false)} className="btn-secondary">Скасувати</button></div>
        </div>
      )}
      <div className="card overflow-hidden">
        <table className="w-full text-sm"><thead><tr className="bg-gray-50 border-b"><th className="text-left px-4 py-3 font-medium">Документ</th><th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Дата</th><th className="text-right px-4 py-3 font-medium">Дії</th></tr></thead>
          <tbody>{docs.map(d => (<tr key={d.id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-4 py-3"><div className="flex items-center gap-3"><FileText size={18} className="text-primary-500 shrink-0"/><span className="font-medium">{d.title}</span></div></td><td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{formatDateShort(d.createdAt)}</td><td className="px-4 py-3 text-right"><button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={16}/></button></td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}
