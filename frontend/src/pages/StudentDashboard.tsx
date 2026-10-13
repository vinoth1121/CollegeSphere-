import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { Card3D } from '../components/Card3D';
import {
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  Award,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  FileCheck2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/student')
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

  const profile = data?.profile || {};
  const metrics = data?.metrics || {};
  const enrollments = data?.enrollments || [];
  const results = data?.results || [];
  const invoices = data?.invoices || [];

  return (
    <div className="space-y-6">
      {/* 3D Student Identity Hero Card */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/95 to-brand-950/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 p-0.5 shadow-xl shadow-brand-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-brand-300">
                {profile.firstName?.[0]}
                {profile.lastName?.[0]}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge variant="success" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  Enrolled & Active
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Roll Number: <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{profile.studentNumber}</span> •
                Programme: {profile.programmeId?.programmeName || 'B.Tech in Computer Science'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Class: <span className="text-slate-200 font-semibold">{profile.classId?.className || 'CSE-3A'}</span> •
                Academic Term: <span className="text-slate-200 font-semibold">Semester {profile.currentSemesterId?.semesterNumber || 5} (AY 2025-2026)</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Live Attendance
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-0.5">
                {metrics.attendancePercentage ?? 100}%
              </p>
              <span className="text-[10px] text-emerald-300/80 font-medium">Quota Satisfied</span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-md text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                Current Standing
              </p>
              <p className="text-2xl font-black text-amber-400 mt-0.5">
                A+ Grade
              </p>
              <span className="text-[10px] text-amber-300/80 font-medium">CGPA 9.2 / 10</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card3D maxTilt={6}>
          <StatCard
            title="Enrolled Courses"
            value={metrics.enrolledCoursesCount ?? 0}
            subtitle="Current semester subjects"
            icon={BookOpen}
            color="blue"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Attendance Status"
            value={`${metrics.attendancePercentage ?? 100}%`}
            subtitle={
              (metrics.attendancePercentage ?? 100) >= 75
                ? 'Above 75% required quota'
                : 'Warning: Low attendance'
            }
            icon={CalendarCheck2}
            color={(metrics.attendancePercentage ?? 100) >= 75 ? 'emerald' : 'rose'}
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Published Grades"
            value={metrics.publishedResultsCount ?? 0}
            subtitle="Verified examination papers"
            icon={Award}
            color="indigo"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Fee Dues"
            value={`₹${(metrics.totalFeeDues ?? 0).toLocaleString()}`}
            subtitle={metrics.totalFeeDues === 0 ? 'Clearance Issued' : 'Semester balance pending'}
            icon={CreditCard}
            color={metrics.totalFeeDues === 0 ? 'emerald' : 'amber'}
          />
        </Card3D>
      </div>

      {/* Enrolled Courses & Schedule Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Enrolled Semester Courses</h3>
              <p className="text-xs text-slate-500">Active subjects & departmental faculties</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {enrollments.length} Registered
            </span>
          </div>

          <div className="space-y-3">
            {enrollments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No enrolled courses found.</p>
            ) : (
              enrollments.map((enr: any) => {
                const offering = enr.courseOfferingId || {};
                const course = offering.courseId || {};
                return (
                  <div
                    key={enr._id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="p-2.5 bg-brand-50 text-brand-600 rounded-xl mt-0.5">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                            {course.courseCode}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{course.courseName}</h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Credits: <span className="font-semibold text-slate-700">{course.credits || 4}</span> •
                          Type: <span className="capitalize">{course.courseType || 'Core'}</span> •
                          Faculty: Dr. Rajesh Kumar
                        </p>
                      </div>
                    </div>
                    <Badge variant="success" className="self-start sm:self-center">
                      Enrolled
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Examination & Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Published Results</h3>
              <p className="text-xs text-slate-500">Official audited grades</p>
            </div>
            <Link to="/examinations" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Exam Portal
            </Link>
          </div>

          <div className="space-y-3">
            {results.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No published results yet.</p>
            ) : (
              results.map((res: any) => {
                const exam = res.examinationId || {};
                return (
                  <div key={res._id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{exam.examinationName}</h4>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {res.grade || 'A+'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                      <span>Score: {res.marksObtained} / {exam.maximumMarks || 50}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Verified</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Fee Invoicing Snapshot */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-2">Institutional Fee Status</h4>
            {invoices.length > 0 ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800">{invoices[0].invoiceNumber}</p>
                  <p className="text-[11px] text-slate-500">Total: ₹{invoices[0].totalAmount.toLocaleString()}</p>
                </div>
                <Badge variant={invoices[0].status === 'paid' ? 'success' : 'warning'}>
                  {invoices[0].status.replace('_', ' ')}
                </Badge>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active invoices found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
