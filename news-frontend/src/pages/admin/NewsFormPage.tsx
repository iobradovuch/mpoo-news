import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, Plus, X, Link as LinkIcon, ImagePlus } from 'lucide-react';
import apiService from '../../services/api';
import RichTextEditor from '../../components/editor/RichTextEditor';
import type { Category, NewsCreateRequest } from '../../types';
import { getImageUrl } from '../../lib/utils';

export default function NewsFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<NewsCreateRequest>({
    title: '',
    summary: '',
    content: '',
    categoryId: 0,
    published: false,
    mainImageUrl: '',
    imageUrls: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [galleryUrl, setGalleryUrl] = useState('');

  useEffect(() => {
    apiService.getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (id) {
      apiService.getNewsById(parseInt(id)).then((n) =>
        setForm({
          title: n.title,
          summary: n.summary,
          content: n.content,
          categoryId: n.category?.id || 0,
          published: n.published,
          publishedDate: n.publishedDate,
          mainImageUrl: n.mainImageUrl,
          imageUrls: n.imageUrls,
        })
      );
    }
  }, [id]);

  const handleMainImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await apiService.uploadImage(file);
      setForm((f) => ({ ...f, mainImageUrl: url }));
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleEditorImageUpload = useCallback(async (file: File): Promise<string> => {
    const url = await apiService.uploadImage(file);
    return url;
  }, []);

  const handleContentChange = useCallback((html: string) => {
    setForm((f) => ({ ...f, content: html }));
  }, []);

  // Галерея: завантаження файлів
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingGallery(true);
    try {
      const uploadPromises = Array.from(files).map((file) => apiService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      setForm((f) => ({ ...f, imageUrls: [...(f.imageUrls || []), ...urls] }));
    } catch (err) {
      console.error('Gallery upload error:', err);
    } finally {
      setUploadingGallery(false);
      e.target.value = '';
    }
  };

  // Галерея: додати за URL
  const handleAddGalleryUrl = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return;
    setForm((f) => ({ ...f, imageUrls: [...(f.imageUrls || []), url] }));
    setGalleryUrl('');
    setShowUrlInput(false);
  };

  // Галерея: видалити фото
  const handleRemoveGalleryImage = (index: number) => {
    setForm((f) => ({
      ...f,
      imageUrls: (f.imageUrls || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) await apiService.updateNews(parseInt(id!), form);
      else await apiService.createNews(form);
      navigate('/admin/news');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Назад
      </button>

      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? 'Редагувати новину' : 'Нова новина'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-4xl">
        {/* Title */}
        <div className="card p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Заголовок
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Введіть заголовок новини"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Короткий опис
            </label>
            <textarea
              value={form.summary}
              onChange={(e) =>
                setForm((f) => ({ ...f, summary: e.target.value }))
              }
              rows={2}
              className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Короткий опис для попереднього перегляду"
            />
          </div>
        </div>

        {/* Content - Rich Text Editor */}
        <div className="card p-6">
          <label className="block text-sm font-medium mb-2">Контент</label>
          <RichTextEditor
            content={form.content}
            onChange={handleContentChange}
            onImageUpload={handleEditorImageUpload}
            placeholder="Почніть вводити текст новини..."
          />
        </div>

        {/* Settings */}
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Категорія
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    categoryId: parseInt(e.target.value),
                  }))
                }
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={0}>Оберіть категорію</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Image */}
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Головне зображення
              </label>
              <label className="flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={16} />
                {uploading ? 'Завантаження...' : 'Обрати файл'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageUpload}
                  className="hidden"
                />
              </label>
              {form.mainImageUrl && (
                <img
                  src={form.mainImageUrl}
                  className="mt-2 h-20 rounded-lg object-cover"
                  alt=""
                />
              )}
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-sm">Опублікувати</span>
            </label>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">
              <ImagePlus size={16} className="inline mr-1.5 -mt-0.5" />
              Фотогалерея
            </label>
            <span className="text-xs text-gray-400">
              {(form.imageUrls || []).length} фото
            </span>
          </div>

          {/* Gallery preview grid */}
          {form.imageUrls && form.imageUrls.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {form.imageUrls.map((url, i) => (
                <div key={i} className="relative group">
                  <img
                    src={getImageUrl(url)}
                    alt=""
                    className="w-full aspect-video object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    title="Видалити"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add buttons */}
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors text-gray-600">
              <Upload size={16} />
              {uploadingGallery ? 'Завантаження...' : 'Завантажити фото'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="hidden"
                disabled={uploadingGallery}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg text-sm hover:bg-gray-50 transition-colors text-gray-600"
            >
              <LinkIcon size={16} />
              Додати за посиланням
            </button>
          </div>

          {/* URL input */}
          {showUrlInput && (
            <div className="flex gap-2">
              <input
                type="url"
                value={galleryUrl}
                onChange={(e) => setGalleryUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddGalleryUrl();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            <Save size={18} className="mr-2" />
            {saving ? 'Збереження...' : 'Зберегти'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/news')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Скасувати
          </button>
        </div>
      </form>
    </div>
  );
}
