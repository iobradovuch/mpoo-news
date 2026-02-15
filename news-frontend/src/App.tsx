import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

const HomePage = lazy(() => import('./pages/HomePage'));
const NewsPage = lazy(() => import('./pages/NewsPage'));
const NewsDetailPage = lazy(() => import('./pages/NewsDetailPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));

const AdminDashboard = lazy(() => import('./pages/admin/DashboardPage'));
const AdminNewsPage = lazy(() => import('./pages/admin/NewsListPage'));
const AdminNewsForm = lazy(() => import('./pages/admin/NewsFormPage'));
const AdminCategories = lazy(() => import('./pages/admin/CategoriesPage'));
const AdminDocuments = lazy(() => import('./pages/admin/DocumentsPage'));
const AdminTeam = lazy(() => import('./pages/admin/TeamListPage'));
const AdminTeamForm = lazy(() => import('./pages/admin/TeamFormPage'));
const AdminNewsImport = lazy(() => import('./pages/admin/NewsImportPage'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Завантаження...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/:id" element={<NewsDetailPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contacts" element={<ContactsPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="news" element={<AdminNewsPage />} />
            <Route path="news/create" element={<AdminNewsForm />} />
            <Route path="news/edit/:id" element={<AdminNewsForm />} />
            <Route path="news/import" element={<AdminNewsImport />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="team" element={<AdminTeam />} />
            <Route path="team/create" element={<AdminTeamForm />} />
            <Route path="team/edit/:id" element={<AdminTeamForm />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
