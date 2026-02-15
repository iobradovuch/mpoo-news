import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, Phone, Mail, MapPin, GraduationCap } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Головна' },
  { to: '/news', label: 'Новини' },
  { to: '/documents', label: 'Документи' },
  { to: '/about', label: 'Про нас' },
  { to: '/contacts', label: 'Контакти' },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface-100">
      {/* Header */}
      <header className="bg-white sticky top-0 z-50 border-b border-surface-200 shadow-nav">
        <div className="container-page">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3.5 group">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <GraduationCap size={24} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-base font-bold text-surface-800 leading-tight tracking-tight">Чернівецька міська організація</p>
                <p className="text-xs text-surface-500 leading-tight mt-0.5">Профспілки працівників освіти і науки України</p>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-surface-600 hover:text-surface-800 hover:bg-surface-100'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 rounded-lg flex items-center justify-center text-surface-600 hover:bg-surface-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute top-20 inset-x-0 bg-white border-b border-surface-200 shadow-elevated py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-page">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'text-brand-700 bg-brand-50'
                        : 'text-surface-600 hover:text-surface-800 hover:bg-surface-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-surface-800 text-white mt-6">
        <div className="container-page py-14 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Link to="/" className="inline-flex items-center gap-3.5 mb-6 group">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-900/30 group-hover:shadow-brand-500/30 transition-shadow">
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white leading-tight tracking-tight">Чернівецька міська організація</p>
                  <p className="text-sm text-blue-300 leading-tight mt-0.5">Профспілки працівників освіти і науки України</p>
                </div>
              </Link>
              <p className="text-base text-surface-400 leading-relaxed max-w-sm">
                Захист трудових, соціально-економічних прав та інтересів працівників освіти і науки України.
              </p>
            </div>

            {/* Navigation column */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-6">Навігація</h4>
              <ul className="space-y-3.5">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-base text-surface-300 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts column */}
            <div className="md:col-span-4">
              <h4 className="text-sm font-semibold text-surface-400 uppercase tracking-wider mb-6">Контакти</h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-400 shrink-0 mt-0.5" />
                  <span className="text-base text-surface-300">вул. Поштова, 3,<br />м. Чернівці, 58000</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-400 shrink-0" />
                  <a href="tel:+380372527067" className="text-base text-surface-300 hover:text-white transition-colors">+380372527067</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-400 shrink-0" />
                  <a href="mailto:mpoo@ukr.net" className="text-base text-surface-300 hover:text-white transition-colors">mpoo@ukr.net</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-700">
          <div className="container-page py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-surface-500">
                &copy; {new Date().getFullYear()} Чернівецька міська організація Профспілки працівників освіти і науки України
              </p>
              <p className="text-sm text-surface-500">
                Усі права захищені
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
