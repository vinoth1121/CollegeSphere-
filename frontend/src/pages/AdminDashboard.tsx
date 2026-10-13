import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { Card3D } from '../components/Card3D';
import {
  Users,
  UserCheck,
  Building2,
  BookMarked,
  CreditCard,
  CalendarCheck2,
  TrendingUp,
  ShieldCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const DEPARTMENT_DATA = [
  { name: 'CSE', students: 85, color: '#2563eb' },
  { name: 'AI & DS', students: 68, color: '#38bdf8' },
  { name: 'ECE', students: 54, color: '#818cf8' },
  { name: 'MECH', students: 42, color: '#10b981' },
  { name: 'CIVIL', students: 35, color: '#f59e0b' },
  { name: 'BIOTECH', students: 28, color: '#ec4899' },
];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/admin')
      .then((res) => setData(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* 3D Modern Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415514_1px,transparent_1px),linear-gradient(to_bottom,#33415514_1px,transparent_1px)] bg-[size:32px_32px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-brand-950/70" />

        <div className="relative z-10 p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                Autonomous Academic Governance • AY 2025-2026
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                Semester 5 Active
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Institutional Governance Command
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Real-time administrative telemetry for Imperial College of Engineering & Technology.
              Monitoring student admissions, faculty roster allocations, course syllabus completion, and automated fee collections.
            </p>

            <div className="flex flex-wrap gap-3 mt-5">
              <Link
                to="/students"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5"
              >
                <Users className="w-4 h-4" />
                Admit Student
              </Link>
              <Link
                to="/reports"
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                Export CSV Report
              </Link>
            </div>
          </div>

          {/* Quick Institutional Credentials Pill */}
          <div className="bg-slate-950/60 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col gap-3 min-w-[240px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">NAAC A++ Grade</div>
                <div className="text-[11px] text-slate-400 font-mono">CGPA 3.82 / 4.00</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">6 Departments</div>
                <div className="text-[11px] text-slate-400">NBA Tier-1 Accredited</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid with 3D Tilt Perspective Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card3D maxTilt={6}>
          <StatCard
            title="Active Students"
            value={metrics.totalStudents ?? 0}
            subtitle="Enrolled across all depts"
            icon={Users}
            color="blue"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Teaching Faculty"
            value={metrics.totalFaculty ?? 0}
            subtitle="Full-time academic staff"
            icon={UserCheck}
            color="emerald"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Active Offerings"
            value={metrics.totalActiveCourseOfferings ?? 0}
            subtitle="Current semester courses"
            icon={BookMarked}
            color="indigo"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Attendance Rate"
            value={`${metrics.overallAttendanceRate ?? 0}%`}
            subtitle="Campus-wide average"
            icon={CalendarCheck2}
            color="purple"
          />
        </Card3D>
      </div>

      {/* Interactive Analytics Section: Department Distribution & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Enrollment Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Enrolment</h3>
              <p className="text-xs text-slate-500">Student distribution across 6 departments</p>
            </div>
            <Link to="/departments" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View All
            </Link>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="students" fill="#2563eb" radius={[6, 6, 0, 0]}>
                  {DEPARTMENT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Collection & Fee Health */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Fee Collection & Revenue Health</h3>
              <p className="text-xs text-slate-500">Current Academic Year billing reconciliation</p>
            </div>
            <Link
              to="/fees"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Manage Invoicing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-semibold text-slate-500">Total Invoiced</p>
              <h4 className="text-xl font-black text-slate-900 mt-1">
                ₹{(metrics.totalInvoiced || 0).toLocaleString()}
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700">Total Collected</p>
              <h4 className="text-xl font-black text-emerald-900 mt-1">
                ₹{(metrics.totalCollected || 0).toLocaleString()}
              </h4>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-semibold text-amber-700">Outstanding Balance</p>
              <h4 className="text-xl font-black text-amber-900 mt-1">
                ₹{(metrics.totalPending || 0).toLocaleString()}
              </h4>
            </div>
          </div>

          {/* Progress Bar with Gradient */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-600">Institutional Recovery Ratio</span>
              <span className="text-slate-900 font-bold">
                {metrics.totalInvoiced > 0
                  ? Math.round((metrics.totalCollected / metrics.totalInvoiced) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 shadow-sm"
                style={{
                  width: `${
                    metrics.totalInvoiced > 0
                      ? Math.min(100, Math.round((metrics.totalCollected / metrics.totalInvoiced) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Operational Actions & Live Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Operations Grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Administrative Actions</h3>
          <p className="text-xs text-slate-500 mb-4">Direct operational shortcuts</p>
          <div className="space-y-2">
            <Link
              to="/students"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-xs font-semibold text-slate-800 group"
            >
              <span>🎓 Student Admissions & SIS Directory</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to="/attendance"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-xs font-semibold text-slate-800 group"
            >
              <span>📅 Attendance Roster Tracker</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to="/examinations"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-xs font-semibold text-slate-800 group"
            >
              <span>📝 Examinations & Official Results</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
            <Link
              to="/announcements"
              className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-xs font-semibold text-slate-800 group"
            >
              <span>📢 Campus Broadcasts & Circulars</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Recent Immutable Audit Log Stream */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Immutable Audit Activity</h3>
              <p className="text-xs text-slate-500">Cryptographically verifiable institutional events</p>
            </div>
            <Link
              to="/audit-logs"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {(data?.recentAudit || []).slice(0, 5).map((log: any) => (
              <div key={log._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{log.action}</p>
                    <p className="text-slate-500 text-[11px]">
                      Resource: <span className="font-mono">{log.resourceType}</span> • Actor:{' '}
                      <span className="font-semibold">{log.actorRole || 'System'}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={log.outcome === 'SUCCESS' ? 'success' : 'danger'}>
                    {log.outcome}
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
