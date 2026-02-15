import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import apiService from '../../services/api';
import type { TeamMember } from '../../types';
import { getImageUrl } from '../../lib/utils';

export default function TeamListPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const fetch = () => apiService.getAllTeamMembersForAdmin().then(setTeam);
  useEffect(() => { fetch(); }, []);
  const handleDelete = async (id: number) => { if (confirm('Видалити?')) { await apiService.deleteTeamMember(id); fetch(); } };

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className="text-2xl font-bold">Команда</h1><Link to="/admin/team/create" className="btn-primary"><Plus size={18} className="mr-2"/>Додати</Link></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map(m => (
          <div key={m.id} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">{m.photoUrl ? <img src={getImageUrl(m.photoUrl)} className="w-full h-full object-cover" alt=""/> : <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-500 font-bold">{m.name.charAt(0)}</div>}</div>
              <div className="min-w-0"><p className="font-medium truncate">{m.name}</p><p className="text-xs text-gray-500 truncate">{m.position}</p></div>
            </div>
            <div className="flex items-center gap-1 border-t pt-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${m.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>{m.active ? 'Активний' : 'Неактивний'}</span>
              <div className="flex-1"/>
              <Link to={`/admin/team/edit/${m.id}`} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><Edit size={14}/></Link>
              <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
