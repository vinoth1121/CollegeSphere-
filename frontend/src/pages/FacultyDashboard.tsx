import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { Card3D } from '../components/Card3D';
import { BookOpen, Users, CalendarCheck2, Award, Clock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/faculty')
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

  const profile = data?.facultyProfile || {};
  const metrics = data?.metrics || {};
  const offerings = data?.assignedOfferings || [];
  const sessions = data?.todaySessions || [];
  const assessments = data?.pendingAssessments || [];

  return (
    <div className="space-y-6">
      {/* 3D Modern Profile Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-500 p-0.5 shadow-lg shadow-brand-500/20">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-black text-2xl text-brand-300">
              {profile.firstName?.[0]}
              {profile.lastName?.[0]}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {profile.firstName} {profile.lastName}
              </h2>
              <Badge variant="info" className="bg-brand-500/20 text-brand-300 border-brand-500/30">
                {profile.designation || 'Professor & Head'}
              </Badge>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Employee ID: <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">{profile.employeeNumber}</span> •
              Qualification: <span className="text-slate-200">{profile.qualification || 'Ph.D. in Computer Science'}</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center space-x-3">
          <Link
            to="/attendance"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/30 flex items-center gap-1.5"
          >
            <CalendarCheck2 className="w-4 h-4" />
            Record Attendance
          </Link>
          <Link
            to="/examinations"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Award className="w-4 h-4" />
            Enter Exam Marks
          </Link>
        </div>
      </div>

      {/* Metrics Grid with 3D Tilt */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card3D maxTilt={6}>
          <StatCard
            title="Assigned Courses"
            value={metrics.totalAssignedCourses ?? 0}
            subtitle="Current semester subjects"
            icon={BookOpen}
            color="blue"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Teaching Load"
            value={`${metrics.totalTeachingLoadHours ?? 0} hrs/wk`}
            subtitle="Theory & laboratory hours"
            icon={Clock}
            color="emerald"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Enrolled Students"
            value={metrics.totalStudentsTaught ?? 0}
            subtitle="Across assigned classes"
            icon={Users}
            color="indigo"
          />
        </Card3D>
      </div>

      {/* Assigned Course Offerings & Pending Grading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Course Offerings</h3>
              <p className="text-xs text-slate-500">Current syllabus progress & class sections</p>
            </div>
            <Link to="/courses" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Course Catalog
            </Link>
          </div>

          <div className="space-y-3">
            {offerings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No assigned courses found.</p>
            ) : (
              offerings.map((off: any) => {
                const course = off.courseId || {};
                const cls = off.classId || {};
                return (
                  <div
                    key={off._id}
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
                          Class: <span className="font-semibold text-slate-700">{cls.className || 'Batch A'}</span> •
                          Credits: {course.credits || 4} • Enrolled: {off.enrolledCount || 0} students
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/attendance"
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-brand-500 text-slate-700 hover:text-brand-600 transition-all self-start sm:self-center"
                    >
                      Roster
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Assessment Evaluation Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Grading & Evaluation</h3>
              <p className="text-xs text-slate-500">Scheduled examinations</p>
            </div>
            <Link to="/examinations" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Exam Office
            </Link>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold">Midterm 1 Marks Published</span>
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                All 5 student mark sheets submitted, audited, and verified by Exam Controller.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-xs font-bold text-slate-800">Upcoming: Semester Final Lab</span>
              <p className="text-[11px] text-slate-500 mt-1">Scheduled for November 12, 2025.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
