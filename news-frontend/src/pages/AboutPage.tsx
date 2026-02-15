import { useState, useEffect } from 'react';
import { Shield, Users, Scale, Handshake, Heart, BookOpen, Phone, Mail, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../services/api';
import type { TeamMember } from '../types';
import { getImageUrl } from '../lib/utils';

const directions = [
  {
    icon: Shield,
    title: 'Правовий захист',
    text: 'Безкоштовна юридична допомога членам профспілки з питань трудового законодавства, захист у судах та консультації з трудових спорів.',
  },
  {
    icon: Scale,
    title: 'Контроль умов праці',
    text: 'Моніторинг дотримання законодавства про охорону праці в навчальних закладах, перевірка умов роботи педагогів та науковців.',
  },
  {
    icon: Handshake,
    title: 'Колективні договори',
    text: 'Ведення переговорів з роботодавцями, укладення колективних договорів для забезпечення гідних умов праці та соціальних гарантій.',
  },
  {
    icon: Heart,
    title: 'Соціальний захист',
    text: 'Матеріальна допомога членам профспілки, організація оздоровлення та відпочинку, підтримка у складних життєвих обставинах.',
  },
  {
    icon: BookOpen,
    title: 'Професійний розвиток',
    text: 'Організація семінарів, тренінгів та конференцій для підвищення кваліфікації працівників освіти та обмін досвідом.',
  },
  {
    icon: Users,
    title: 'Представництво інтересів',
    text: 'Участь у формуванні освітньої політики міста, взаємодія з органами місцевого самоврядування та представництво інтересів працівників.',
  },
];

export default function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  useEffect(() => { apiService.getTeamMembers().then(setTeam).catch(console.error); }, []);

  return (
    <div>
      {/* Напрямки діяльності */}
      <section className="container-page py-16">
        <div className="text-center mb-12">
          <div className="badge mb-3">Чим ми займаємося</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-surface-800">Напрямки діяльності</h2>
          <p className="text-surface-600 mt-2 max-w-xl mx-auto">Основні сфери роботи нашої організації для захисту та підтримки працівників освіти</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {directions.map((item, i) => (
            <div key={i} className="card p-6 group hover:shadow-card-hover transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                <item.icon size={22} className="text-brand-600" />
              </div>
              <h3 className="font-bold text-surface-800 mb-2">{item.title}</h3>
              <p className="text-sm text-surface-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Місія */}
      <section className="bg-white border-y border-surface-200">
        <div className="container-page py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="badge mb-3">Наша місія</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-800 mb-4">Захист прав кожного працівника освіти</h2>
              <p className="text-surface-600 leading-relaxed mb-4">
                Профспілка працівників освіти і науки — це організація, яка стоїть на сторожі інтересів педагогів, вчителів, вихователів та науковців. Ми забезпечуємо правовий захист, контролюємо дотримання трудового законодавства та ведемо постійний діалог з органами влади.
              </p>
              <p className="text-surface-600 leading-relaxed mb-6">
                Наша мета — гідні умови праці, справедлива оплата та соціальні гарантії для кожного працівника освітньої галузі Чернівецької громади.
              </p>
              <Link to="/contacts" className="btn-primary inline-flex items-center">
                Зв'язатися з нами <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              <div className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-800 mb-1">Безкоштовна юридична допомога</h4>
                  <p className="text-sm text-surface-600">Кваліфіковані консультації з питань трудового права для всіх членів профспілки</p>
                </div>
              </div>
              <div className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Handshake size={20} className="text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-800 mb-1">Колективні переговори</h4>
                  <p className="text-sm text-surface-600">Представництво інтересів працівників у відносинах з роботодавцями</p>
                </div>
              </div>
              <div className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                  <Heart size={20} className="text-brand-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-surface-800 mb-1">Соціальна підтримка</h4>
                  <p className="text-sm text-surface-600">Матеріальна допомога, оздоровлення та підтримка у складних ситуаціях</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Команда */}
      {team.length > 0 && (
        <section className="container-page py-16">
          <div className="text-center mb-12">
            <div className="badge mb-3">Керівництво</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-800">Керівництво організації</h2>
            <p className="text-surface-600 mt-2">Люди, які працюють для захисту ваших прав</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member) => (
              <div key={member.id} className="card p-8 text-center w-[360px]">
                <div className="w-28 h-28 rounded-full mx-auto mb-5 overflow-hidden bg-surface-200 shadow-md ring-4 ring-surface-100">
                  {member.photoUrl ? (
                    <img src={getImageUrl(member.photoUrl)} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-surface-500 text-2xl font-bold">{member.name.charAt(0)}</div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-surface-800">{member.name}</h3>
                <p className="text-sm text-brand-600 font-medium mt-1">{member.position}</p>
                {member.description && <p className="text-sm text-surface-500 mt-3 leading-relaxed">{member.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-brand-50 border-t border-surface-200">
        <div className="container-page py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-surface-800">Маєте питання або потребуєте допомоги?</h3>
              <p className="text-surface-600 mt-1">Зв'яжіться з нами — ми завжди готові допомогти</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="tel:+380372527067" className="btn-secondary inline-flex items-center gap-2">
                <Phone size={16} /> +380372527067
              </a>
              <a href="mailto:mpoo@ukr.net" className="btn-secondary inline-flex items-center gap-2">
                <Mail size={16} /> mpoo@ukr.net
              </a>
              <Link to="/contacts" className="btn-primary">
                Контакти
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
