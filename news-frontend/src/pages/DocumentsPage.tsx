import { useState, useEffect } from 'react';
import { FileText, Download, FolderOpen } from 'lucide-react';
import apiService from '../services/api';
import type { Document } from '../types';
import { getImageUrl } from '../lib/utils';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { apiService.getDocuments().then(setDocuments).catch(console.error).finally(() => setLoading(false)); }, []);

  return (
    <div>
      <div className="bg-white border-b border-surface-200">
        <div className="container-page py-8">
          <h1 className="text-3xl font-bold text-surface-800">Документи</h1>
          <p className="text-surface-600 mt-1">Офіційні документи та матеріали організації</p>
        </div>
      </div>
      <div className="container-page py-10">
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i=>(<div key={i} className="card animate-pulse flex items-center gap-4 p-5"><div className="w-10 h-10 bg-surface-200 rounded-lg shrink-0"/><div className="flex-1"><div className="h-4 bg-surface-200 rounded w-1/2 mb-2"/><div className="h-3 bg-surface-200 rounded w-1/3"/></div></div>))}</div>
        ) : documents.length === 0 ? (
          <div className="py-20 text-center">
            <FolderOpen size={48} className="text-surface-300 mx-auto mb-4" />
            <p className="text-surface-700 font-medium text-lg">Документів поки немає</p>
            <p className="text-sm text-surface-500 mt-1">Документи з'являться тут після додавання</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="card-hover flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0"><FileText size={18} className="text-brand-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-800 text-sm truncate">{doc.title}</h3>
                  {doc.description && <p className="text-sm text-surface-600 truncate mt-0.5">{doc.description}</p>}
                </div>
                <a href={getImageUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs px-4 py-2 shrink-0"><Download size={14} className="mr-1.5" /> Завантажити</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
