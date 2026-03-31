import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LivePage from '@/pages/LivePage';
import ArchivePage from '@/pages/ArchivePage';
import ReadingPlanPage from '@/pages/ReadingPlanPage';
import ContactPage from '@/pages/ContactPage';
import AdminPage from '@/pages/AdminPage';
import StiriPage from '@/pages/StiriPage';

export default function App() {
  return (
    <Routes>
      {/* Admin has its own full-screen layout (no Nav / Footer) */}
      <Route path="/admin" element={<AdminPage />} />

      {/* All other routes use the shared Layout */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/arhiva" element={<ArchivePage />} />
              <Route path="/plan-citire" element={<ReadingPlanPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/stiri" element={<StiriPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
