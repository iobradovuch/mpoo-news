import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';
import apiService from '../../services/api';

export default function TeamFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState({ name: '', position: '', description: '', email: '', phone: '', order: 0, active: true });
  const [photo, setPhoto] = useState<File | null>(null);
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      apiService.getTeamMemberById(parseInt(id)).then(m => {
        setForm({
          name: m.name,
          position: m.position,
          description: m.description || '',
          email: m.email || '',
          phone: m.phone || '',
          order: m.order,
          active: m.active,
        });
        if (m.photoUrl) setCurrentPhotoUrl(m.photoUrl);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Upload photo first if selected
      let photoUrl = currentPhotoUrl;
      if (photo) {
        photoUrl = await apiService.uploadImage(photo);
      }

      // Send JSON data
      const data = {
        name: form.name,
        position: form.position,
        description: form.description,
        email: form.email || null,
        phone: form.phone || null,
        photoUrl: photoUrl || null,
        order: form.order,
        active: form.active,
      };

      if (isEdit) {
        await apiService.updateTeamMember(parseInt(id!), data);
      } else {
        await apiService.createTeamMember(data);
      }

      navigate('/admin/team');
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || 'Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 text-sm"><ArrowLeft size={16}/>Назад</button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Редагувати члена команди' : 'Новий член команди'}</h1>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="card p-6 space-y-5 max-w-2xl">
        <div><label className="block text-sm font-medium mb-1.5">Ім'я</label><input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
        <div><label className="block text-sm font-medium mb-1.5">Посада</label><input value={form.position} onChange={e => setForm(f=>({...f,position:e.target.value}))} required className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
        <div><label className="block text-sm font-medium mb-1.5">Опис</label><textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} rows={4} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1.5">Email</label><input value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Телефон</label><input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium mb-1.5">Порядок</label><input type="number" value={form.order} onChange={e => setForm(f=>({...f,order:parseInt(e.target.value) || 0}))} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"/></div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Фото</label>
            <label className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm cursor-pointer hover:bg-gray-50">
              <Upload size={16}/>{photo ? photo.name : currentPhotoUrl ? 'Змінити фото' : 'Обрати файл'}
              <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} className="hidden"/>
            </label>
            {currentPhotoUrl && !photo && (
              <p className="text-xs text-gray-400 mt-1 truncate">Поточне: {currentPhotoUrl.split('/').pop()}</p>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={e => setForm(f=>({...f,active:e.target.checked}))} className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"/><span className="text-sm">Активний</span></label>
        <button type="submit" disabled={saving} className="btn-primary"><Save size={18} className="mr-2"/>{saving ? 'Збереження...' : 'Зберегти'}</button>
      </form>
    </div>
  );
}
