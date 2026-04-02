import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';

const HomePage = lazy(() => import('@/pages/HomePage'));
const LivePage = lazy(() => import('@/pages/LivePage'));
const ReadingPlanPage = lazy(() => import('@/pages/ReadingPlanPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const StiriPage = lazy(() => import('@/pages/StiriPage'));

function PageLoader() {
  return <div className="min-h-screen bg-slate-900" />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/plan-citire" element={<ReadingPlanPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/stiri" element={<StiriPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Suspense>
  );
}
