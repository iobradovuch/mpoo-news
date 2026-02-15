import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { getImageUrl } from '../lib/utils';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex, onClose }: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % images.length);
    setZoomed(false);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    setZoomed(false);
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20">
        <span className="text-white/70 text-sm font-medium">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed((z) => !z); }}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={zoomed ? 'Зменшити' : 'Збільшити'}
          >
            {zoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Закрити (Esc)"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="relative z-10 flex items-center justify-center w-full h-full px-16 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={getImageUrl(images[currentIndex])}
          alt=""
          className={`max-h-full rounded-lg shadow-2xl transition-transform duration-300 select-none ${
            zoomed ? 'max-w-none cursor-zoom-out scale-150' : 'max-w-full cursor-zoom-in'
          }`}
          onClick={() => setZoomed((z) => !z)}
          draggable={false}
        />
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors"
            title="Попереднє фото (←)"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white/80 hover:bg-black/60 hover:text-white transition-colors"
            title="Наступне фото (→)"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      {/* Thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center gap-2 px-4 py-4 overflow-x-auto">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setZoomed(false); }}
              className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden border-2 transition-all ${
                i === currentIndex
                  ? 'border-white opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={getImageUrl(url)}
                alt=""
                className="w-full h-full object-cover"
                draggable={false}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
