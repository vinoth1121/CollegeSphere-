import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck2,
  Award,
  CreditCard,
  Bell,
  ShieldAlert,
  FileBarChart,
  BookMarked,
} from 'lucide-react';

interface NavItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      to: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Students',
      to: '/students',
      icon: Users,
      roles: ['admin', 'super_admin', 'hod', 'faculty', 'exam_officer', 'accounts'],
    },
    {
      name: 'Faculty',
      to: '/faculty',
      icon: UserCheck,
      roles: ['admin', 'super_admin', 'hod'],
    },
    {
      name: 'Departments',
      to: '/departments',
      icon: Building2,
      roles: ['admin', 'super_admin', 'hod'],
    },
    {
      name: 'Programmes',
      to: '/programmes',
      icon: GraduationCap,
      roles: ['admin', 'super_admin', 'hod'],
    },
    {
      name: 'Courses',
      to: '/courses',
      icon: BookOpen,
      roles: ['admin', 'super_admin', 'hod', 'faculty'],
    },
    {
      name: 'Course Offerings',
      to: '/offerings',
      icon: BookMarked,
      roles: ['admin', 'super_admin', 'hod', 'faculty'],
    },
    {
      name: 'Attendance',
      to: '/attendance',
      icon: CalendarCheck2,
      roles: ['admin', 'super_admin', 'hod', 'faculty', 'student'],
    },
    {
      name: 'Examinations',
      to: '/examinations',
      icon: Award,
      roles: ['admin', 'super_admin', 'hod', 'faculty', 'exam_officer', 'student'],
    },
    {
      name: 'Fees & Invoicing',
      to: '/fees',
      icon: CreditCard,
      roles: ['admin', 'super_admin', 'accounts', 'student'],
    },
    {
      name: 'Announcements',
      to: '/announcements',
      icon: Bell,
    },
    {
      name: 'Reports',
      to: '/reports',
      icon: FileBarChart,
      roles: ['admin', 'super_admin', 'hod', 'accounts', 'exam_officer'],
    },
    {
      name: 'Audit Logs',
      to: '/audit-logs',
      icon: ShieldAlert,
      roles: ['admin', 'super_admin'],
    },
  ];

  const filteredItems = navItems.filter((item) => {
    if (!item.roles) return true;
    if (!user) return false;
    return user.roles.some((r) => item.roles?.includes(r) || user.roles.includes('super_admin'));
  });

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 text-xs text-slate-400 px-3">
        <p className="font-medium text-slate-300">CollegeSphere v1.0.0</p>
        <p className="text-[10px] mt-0.5">Secure Institutional System</p>
      </div>
    </aside>
  );
};
