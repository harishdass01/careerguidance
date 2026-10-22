import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LoadingScreen } from '@/components/ui';
import { AuthPage } from '@/pages/AuthPage';
import { StudentLayout } from '@/components/StudentLayout';
import { AdminLayout } from '@/components/AdminLayout';

import { StudentDashboard } from '@/pages/student/Dashboard';
import { StudentProfile } from '@/pages/student/Profile';
import { Assessment } from '@/pages/student/Assessment';
import { Recommendations } from '@/pages/student/Recommendations';
import { SkillGap } from '@/pages/student/SkillGap';
import { Roadmap } from '@/pages/student/Roadmap';
import { ResumeAnalyzer } from '@/pages/student/ResumeAnalyzer';
import { CareerExplorer } from '@/pages/student/CareerExplorer';
import { Chatbot } from '@/pages/student/Chatbot';
import { ProgressPage } from '@/pages/student/Progress';

import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminStudents } from '@/pages/admin/Students';
import { AdminCareers } from '@/pages/admin/Careers';
import { AdminSkills } from '@/pages/admin/Skills';
import { AdminQuestions } from '@/pages/admin/Questions';
import { AdminAnalytics } from '@/pages/admin/Analytics';

function ProtectedRoute({ children, requireRole }: { children: React.ReactNode; requireRole?: 'student' | 'admin' }) {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (requireRole && role !== requireRole) {
    return <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { user, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to={role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace /> : <AuthPage />
        }
      />

      {/* Student routes */}
      <Route path="/dashboard" element={<ProtectedRoute requireRole="student"><StudentLayout><StudentDashboard /></StudentLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute requireRole="student"><StudentLayout><StudentProfile /></StudentLayout></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute requireRole="student"><StudentLayout><Assessment /></StudentLayout></ProtectedRoute>} />
      <Route path="/recommendations" element={<ProtectedRoute requireRole="student"><StudentLayout><Recommendations /></StudentLayout></ProtectedRoute>} />
      <Route path="/skill-gap" element={<ProtectedRoute requireRole="student"><StudentLayout><SkillGap /></StudentLayout></ProtectedRoute>} />
      <Route path="/roadmap" element={<ProtectedRoute requireRole="student"><StudentLayout><Roadmap /></StudentLayout></ProtectedRoute>} />
      <Route path="/resume" element={<ProtectedRoute requireRole="student"><StudentLayout><ResumeAnalyzer /></StudentLayout></ProtectedRoute>} />
      <Route path="/explorer" element={<ProtectedRoute requireRole="student"><StudentLayout><CareerExplorer /></StudentLayout></ProtectedRoute>} />
      <Route path="/chatbot" element={<ProtectedRoute requireRole="student"><StudentLayout><Chatbot /></StudentLayout></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute requireRole="student"><StudentLayout><ProgressPage /></StudentLayout></ProtectedRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/students" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminStudents /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/careers" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminCareers /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/skills" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminSkills /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/questions" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminQuestions /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute requireRole="admin"><AdminLayout><AdminAnalytics /></AdminLayout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
