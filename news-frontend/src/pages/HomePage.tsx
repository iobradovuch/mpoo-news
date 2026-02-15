import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Shield, Users, FileText, Scale, BookOpen, Heart,
  Phone, Mail, MapPin, ChevronRight, GraduationCap,
} from 'lucide-react';
import apiService from '../services/api';
import type { News } from '../types';
import { formatDate, truncateText, stripHtml, getImageUrl } from '../lib/utils';

const services = [
  { icon: Shield, title: 'Правовий захист', desc: 'Захист трудових прав та інтересів працівників освіти' },
  { icon: Scale, title: 'Трудові спори', desc: 'Представництво в трудових спорах та конфліктах' },
  { icon: Heart, title: 'Соціальний захист', desc: 'Соціальне страхування та матеріальна допомога' },
  { icon: BookOpen, title: 'Освітні програми', desc: 'Підвищення кваліфікації та освітні заходи' },
  { icon: Users, title: 'Колективні договори', desc: 'Укладання та контроль колективних договорів' },
  { icon: FileText, title: 'Консультації', desc: 'Безоплатні юридичні та фахові консультації' },
];

export default function HomePage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .getNews(0, 6)
      .then((res) => setNews(res.content))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-50 border-b border-surface-200 overflow-hidden">
        {/* Dot pattern texture */}
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: 'radial-gradient(circle, #2563eb 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand-100 rounded-full blur-3xl opacity-40" />

        <div className="container-page relative z-10 py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="badge mb-4">Профспілка працівників освіти і науки України </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-800 tracking-tight leading-[1.1]">
              Чернівецька міська організація Профспілки працівників освіти і науки України 
            </h1>
            <p className="mt-6 text-lg text-surface-600 leading-relaxed max-w-2xl">
              Захист трудових, соціально-економічних прав та інтересів працівників освіти і науки.
              Ми об'єднуємо педагогів, вчителів та науковців міста Чернівці.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/news" className="btn-primary">
                Читати новини <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link to="/about" className="btn-secondary">
                Про організацію
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services — marquee ticker */}
      <section className="py-12 overflow-hidden">
        <div className="container-page mb-6">
          <h2 className="text-2xl font-bold text-surface-800">Наші напрямки</h2>
          <p className="text-surface-600 mt-1">Ключові сфери діяльності організації</p>
        </div>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-surface-100 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-surface-100 to-transparent z-10 pointer-events-none" />
          {/* Track: items duplicated for seamless loop */}
          <div className="marquee-track">
            {[...services, ...services].map((s, i) => (
              <div key={i} className="card-hover p-5 flex gap-4 items-start shrink-0 w-[300px] mx-2">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <s.icon size={20} className="text-brand-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-surface-800 text-sm">{s.title}</h3>
                  <p className="text-xs text-surface-600 mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="bg-white border-t border-b border-surface-200">
        <div className="container-page pt-16 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-surface-800">Останні новини</h2>
              <p className="text-surface-600 mt-1">Актуальна інформація для працівників освіти</p>
            </div>
            <Link to="/news" className="btn-ghost hidden sm:inline-flex">
              Усі новини <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse card p-0">
                  <div className="bg-surface-200 h-52" />
                  <div className="p-5">
                    <div className="bg-surface-200 h-4 rounded w-1/4 mb-3" />
                    <div className="bg-surface-200 h-5 rounded w-3/4 mb-2" />
                    <div className="bg-surface-200 h-4 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((item) => (
                <Link
                  key={item.id}
                  to={`/news/${item.id}`}
                  className="card-hover group flex flex-col"
                >
                  <div className="aspect-[16/10] bg-surface-200 overflow-hidden">
                    {item.mainImageUrl ? (
                      <img
                        src={getImageUrl(item.mainImageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText size={36} className="text-surface-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      {item.category && (
                        <span className="badge text-[10px]">{item.category.name}</span>
                      )}
                      <span className="text-xs text-surface-500">
                        {formatDate(item.publishedDate || item.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-surface-800 leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-surface-600 line-clamp-2 flex-1">
                      {truncateText(stripHtml(item.summary || item.content), 130)}
                    </p>
                    <div className="mt-4 pt-3 border-t border-surface-100 flex items-center text-sm font-medium text-brand-600">
                      Читати далі <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link to="/news" className="btn-secondary">
              Усі новини <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact strip */}
      <section className="container-page pt-3 pb-2">
        <div className="card p-0">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <a href="tel:+380372527067" className="flex items-center gap-4 p-6 group hover:bg-surface-50 transition-colors border-b sm:border-b-0 sm:border-r border-surface-200">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <Phone size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">Телефон</p>
                <p className="font-semibold text-surface-800">+380372527067</p>
              </div>
            </a>
            <a href="mailto:mpoo@ukr.net" className="flex items-center gap-4 p-6 group hover:bg-surface-50 transition-colors border-b sm:border-b-0 sm:border-r border-surface-200">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <Mail size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">Пошта</p>
                <p className="font-semibold text-surface-800">mpoo@ukr.net</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-6">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium">Адреса</p>
                <p className="font-semibold text-surface-800">вул. Поштова, 3</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
