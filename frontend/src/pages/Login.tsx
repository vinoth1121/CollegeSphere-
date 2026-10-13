import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Sparkles,
  Building2,
  Award,
  Users,
  Briefcase,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { Alert } from '../components/Alert';
import { ThreeCanvas } from '../components/ThreeCanvas';
import { Card3D } from '../components/Card3D';

interface DemoRole {
  title: string;
  roleKey: string;
  email: string;
  icon: string;
  badge: string;
  description: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    title: 'College Admin',
    roleKey: 'admin',
    email: 'admin@collegesphere.edu',
    icon: '🛡️',
    badge: 'Super Admin',
    description: 'Full institutional governance, staff directory, audit compliance',
  },
  {
    title: 'Head of Dept (HOD)',
    roleKey: 'hod',
    email: 'hod.cse@collegesphere.edu',
    icon: '🏢',
    badge: 'Dept Chair',
    description: 'Departmental curriculum, class offerings, mark approvals',
  },
  {
    title: 'Faculty Member',
    roleKey: 'faculty',
    email: 'faculty.cse@collegesphere.edu',
    icon: '👨‍🏫',
    badge: 'Faculty',
    description: 'Class session attendance rosters, marks entry sheets',
  },
  {
    title: 'Enrolled Student',
    roleKey: 'student',
    email: 'student.arun@collegesphere.edu',
    icon: '🎓',
    badge: 'Student',
    description: 'Subject enrollment, attendance %, published grades & receipts',
  },
  {
    title: 'Accounts Officer',
    roleKey: 'accounts',
    email: 'accounts@collegesphere.edu',
    icon: '💳',
    badge: 'Finance',
    description: 'Fee structures, invoices, payment receipts, revenue ledger',
  },
  {
    title: 'Exam Controller',
    roleKey: 'exam_officer',
    email: 'exam@collegesphere.edu',
    icon: '📝',
    badge: 'Exam Office',
    description: 'Examination schedules, mark sheets audit, result publishing',
  },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('exam@collegesphere.edu');
  const [password, setPassword] = useState('Password@123');
  const [selectedRole, setSelectedRole] = useState<string>('exam_officer');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide institutional email and password');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || 'Authentication failed. Please verify credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRole = (role: DemoRole) => {
    setSelectedRole(role.roleKey);
    setEmail(role.email);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row overflow-x-hidden selection:bg-brand-500 selection:text-white">
      {/* LEFT COLUMN: 3D Campus Experience & Architectural Showcase */}
      <div className="relative w-full lg:w-7/12 min-h-[460px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-12 overflow-hidden bg-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800">
        {/* Pure Code-Driven Technical Grid & Ambient Glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_20%_-10%,rgba(37,99,235,0.22),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#33415518_1px,transparent_1px),linear-gradient(to_bottom,#33415518_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Interactive Three.js 3D Orbital Canvas Scene */}
        <div className="absolute inset-0 pointer-events-auto opacity-75">
          <ThreeCanvas variant="login" />
        </div>

        {/* Top Header Branding Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-amber-500 p-0.5 shadow-xl shadow-brand-500/20 ring-1 ring-white/20">
              <img
                src="/assets/college-logo.png"
                alt="ICET Logo"
                className="w-full h-full object-cover rounded-[14px]"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Imperial College
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ESTD. 1988
                </span>
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Autonomous Institution of Science & Technology
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-850/80 backdrop-blur-md border border-slate-700/80 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admissions AY 2025-26 Live</span>
          </div>
        </div>

        {/* Center Architectural Pitch */}
        <div className="relative z-10 my-auto py-12 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-5 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Next-Gen Academic Governance
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight sm:leading-none mb-4">
            Shaping Leaders.{' '}
            <span className="bg-gradient-to-r from-brand-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              Powering Discovery.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            CollegeSphere centralizes academic programs, faculty scheduling, daily attendance tracking,
            and digital fee management across 6 multidisciplinary engineering departments.
          </p>

          {/* Institutional Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <Card3D maxTilt={6}>
              <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-brand-400/40 transition-all">
                <Building2 className="w-5 h-5 text-sky-400 mb-1" />
                <div className="text-xl font-extrabold text-white">6</div>
                <div className="text-[11px] text-slate-400 font-medium">Departments</div>
              </div>
            </Card3D>

            <Card3D maxTilt={6}>
              <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-brand-400/40 transition-all">
                <Users className="w-5 h-5 text-indigo-400 mb-1" />
                <div className="text-xl font-extrabold text-white">2,500+</div>
                <div className="text-[11px] text-slate-400 font-medium">Active Students</div>
              </div>
            </Card3D>

            <Card3D maxTilt={6}>
              <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-brand-400/40 transition-all">
                <Award className="w-5 h-5 text-amber-400 mb-1" />
                <div className="text-xl font-extrabold text-white">NAAC A++</div>
                <div className="text-[11px] text-slate-400 font-medium">CGPA 3.82 / 4.0</div>
              </div>
            </Card3D>

            <Card3D maxTilt={6}>
              <div className="p-3.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 hover:border-brand-400/40 transition-all">
                <Briefcase className="w-5 h-5 text-emerald-400 mb-1" />
                <div className="text-xl font-extrabold text-white">98.4%</div>
                <div className="text-[11px] text-slate-400 font-medium">Placement Rate</div>
              </div>
            </Card3D>
          </div>
        </div>

        {/* Bottom Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
          <span>Bengaluru Knowledge Campus • Affiliated to State Tech Univ</span>
          <span className="font-mono">Security Grade: ISO/IEC 27001</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Sign-In & Role Quick Switcher */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-6">
          {/* Header Title */}
          <div>
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              Secure Institutional Portal
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Sign In to Your Account
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your role from below for instant evaluation, or enter your credentials.
            </p>
          </div>

          {/* Quick-Fill Role Switcher Cards */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Demo Role (Quick Fill)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {DEMO_ROLES.map((role) => {
                const isActive = selectedRole === role.roleKey;
                return (
                  <button
                    key={role.roleKey}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`p-2.5 rounded-xl text-left transition-all border cursor-pointer relative ${
                      isActive
                        ? 'bg-brand-950/80 border-brand-500 ring-2 ring-brand-500/30 text-white shadow-md shadow-brand-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between text-base mb-1">
                      <span>{role.icon}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-brand-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {role.badge}
                      </span>
                    </div>
                    <div className="text-xs font-bold truncate">{role.title}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authentication Card */}
          <Card3D maxTilt={4} glowColor="rgba(56, 189, 248, 0.2)">
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
              {error && (
                <Alert
                  type="error"
                  message={error}
                  className="mb-5 bg-rose-950/50 border-rose-800 text-rose-200"
                  onClose={() => setError(null)}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Institutional Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. admin@collegesphere.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-slate-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase text-slate-300">
                      Security Password
                    </label>
                    <span className="text-[11px] text-slate-400 font-mono">Password: Password@123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-800 rounded-xl focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-white placeholder-slate-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/25 transition-all transform active:scale-98 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Enter Institutional Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </Card3D>

          {/* Quick Notice */}
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2.5">
            <BookOpen className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Evaluating as a college committee? All accounts include pre-loaded academic data, course
              rosters, fee receipts, and marks sheets for immediate review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
