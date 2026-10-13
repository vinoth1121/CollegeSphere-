import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './layouts/Layout';
import { Login } from './pages/Login';
import { DashboardRouter } from './pages/DashboardRouter';
import { StudentsPage } from './pages/StudentsPage';
import { FacultyPage } from './pages/FacultyPage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { ProgrammesPage } from './pages/ProgrammesPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseOfferingsPage } from './pages/CourseOfferingsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExaminationsPage } from './pages/ExaminationsPage';
import { FeesPage } from './pages/FeesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ReportsPage } from './pages/ReportsPage';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Protected Routes inside standard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardRouter />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/programmes" element={<ProgrammesPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/offerings" element={<CourseOfferingsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/examinations" element={<ExaminationsPage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
