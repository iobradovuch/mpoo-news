import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const contacts = [
  { icon: MapPin, label: 'Адреса', value: 'вул. Поштова, 3, м. Чернівці, Україна, 58000', href: undefined },
  { icon: Phone, label: 'Телефон', value: '+380372527067', href: 'tel:+380372527067' },
  { icon: Mail, label: 'Електронна пошта', value: 'mpoo@ukr.net', href: 'mailto:mpoo@ukr.net' },
  { icon: Clock, label: 'Графік роботи', value: 'Пн-Чт: 9:00-18:00, Пт: 9:00-16:45 (перерва 13:00-14:00)', href: undefined },
];

export default function ContactsPage() {
  return (
    <div>
      <div className="bg-white border-b border-surface-200">
        <div className="container-page py-8">
          <h1 className="text-3xl font-bold text-surface-800">Контакти</h1>
          <p className="text-surface-600 mt-1">Зв'яжіться з нами будь-яким зручним способом</p>
        </div>
      </div>
      <div className="container-page py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {contacts.map((item, i) => {
              const Tag = item.href ? 'a' : 'div';
              return (
                <Tag key={i} {...(item.href ? { href: item.href } : {})} className="card-hover flex items-center gap-4 p-5 group">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                    <item.icon size={18} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="text-xs text-surface-500 font-medium">{item.label}</p>
                    <p className="font-semibold text-surface-800 mt-0.5">{item.value}</p>
                  </div>
                </Tag>
              );
            })}
          </div>
          <div className="lg:col-span-3">
            <div className="card overflow-hidden h-[420px]">
              <iframe title="Карта" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2635.5!2d25.9358!3d48.2921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDE3JzMxLjYiTiAyNcKwNTYnMDguOSJF!5e0!3m2!1suk!2sua!4v1234567890" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
