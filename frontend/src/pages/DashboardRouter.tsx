import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AdminDashboard } from './AdminDashboard';
import { FacultyDashboard } from './FacultyDashboard';
import { StudentDashboard } from './StudentDashboard';
import { AccountsDashboard } from './AccountsDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  if (user.roles.includes('student')) {
    return <StudentDashboard />;
  }

  if (user.roles.includes('faculty') && !user.roles.includes('admin') && !user.roles.includes('super_admin')) {
    return <FacultyDashboard />;
  }

  if (user.roles.includes('accounts') && !user.roles.includes('admin') && !user.roles.includes('super_admin')) {
    return <AccountsDashboard />;
  }

  // Admin, super_admin, HOD, and Exam Officer default to comprehensive Admin Dashboard
  return <AdminDashboard />;
};
