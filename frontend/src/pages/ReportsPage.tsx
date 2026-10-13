import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { FileBarChart, Download, Users, CheckCircle2, CreditCard, Award } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/admin'),
      api.get('/students?limit=100'),
      api.get('/academic/departments'),
    ]).then(([dRes, sRes, depRes]) => {
      setData({
        dashboard: dRes.data.data,
        students: sRes.data.data,
        departments: depRes.data.data,
      });
      setIsLoading(false);
    });
  }, []);

  const handleExportStudentsCSV = () => {
    if (!data?.students) return;
    const headers = ['Roll Number', 'First Name', 'Last Name', 'Email', 'Department', 'Status'];
    const rows = data.students.map((s: any) => [
      s.studentNumber,
      `"${s.firstName}"`,
      `"${s.lastName}"`,
      s.contact?.email || '',
      s.departmentId?.departmentCode || '',
      s.studentStatus,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `students_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const metrics = data?.dashboard?.metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Governance & Regulatory Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated institutional analytics and official CSV data exports
          </p>
        </div>
        <button
          onClick={handleExportStudentsCSV}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Export Students CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Student Roster"
          value={metrics.totalStudents ?? 0}
          subtitle="Total verified admissions"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Campus Attendance"
          value={`${metrics.overallAttendanceRate ?? 0}%`}
          subtitle="Lecture participation rate"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Collected Revenue"
          value={`₹${(metrics.totalCollected ?? 0).toLocaleString()}`}
          subtitle="Cleared tuition receipts"
          icon={CreditCard}
          color="indigo"
        />
        <StatCard
          title="Outstanding Dues"
          value={`₹${(metrics.totalPending ?? 0).toLocaleString()}`}
          subtitle="Pending collections"
          icon={Award}
          color="amber"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Department Strength & Academic Allocation</h3>
        <p className="text-xs text-slate-500 mb-4">Summary of departments and enrolled students</p>

        <div className="divide-y divide-slate-100">
          {(data?.departments || []).map((dept: any) => {
            const count = (data?.students || []).filter(
              (s: any) => s.departmentId?._id === dept._id || s.departmentId?.departmentCode === dept.departmentCode
            ).length;
            return (
              <div key={dept._id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-brand-700">{dept.departmentCode}</span>
                  <span className="ml-2 font-semibold text-slate-800">{dept.departmentName}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-slate-600 font-medium">
                    Strength: <strong className="text-slate-900">{count}</strong> Students
                  </span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
