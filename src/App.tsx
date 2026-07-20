import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import LivePage from '@/pages/LivePage';
import ReadingPlanPage from '@/pages/ReadingPlanPage';
import ContactPage from '@/pages/ContactPage';
import AdminPage from '@/pages/AdminPage';
import DespreNoi from '@/pages/DespreNoi';

export default function App() {
  return (
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
              <Route path="/despre-noi" element={<DespreNoi />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}
