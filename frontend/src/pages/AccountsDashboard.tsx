import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import { Card3D } from '../components/Card3D';
import { CreditCard, DollarSign, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard/accounts')
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
  const payments = data?.recentPayments || [];

  return (
    <div className="space-y-6">
      {/* 3D Modern Header */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
              Treasury & Accounts
            </span>
            <span className="text-xs text-slate-400 font-medium">Reconciliation AY 2025-2026</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Institutional Accounts & Fee Ledger</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Automated billing reconciliation, digital installment tracking, and payment receipt issuance for Imperial College.
          </p>
        </div>

        <div className="relative z-10">
          <Link
            to="/fees"
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            Manage Invoices & Payments
          </Link>
        </div>
      </div>

      {/* KPI Grid with 3D Tilt Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card3D maxTilt={6}>
          <StatCard
            title="Total Invoiced"
            value={`₹${(metrics.totalInvoiced ?? 0).toLocaleString()}`}
            subtitle={`${(metrics.unpaidInvoices ?? 0) + (metrics.partiallyPaidInvoices ?? 0) + (metrics.fullyPaidInvoices ?? 0)} student invoices generated`}
            icon={CreditCard}
            color="blue"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Total Collected"
            value={`₹${(metrics.totalCollected ?? 0).toLocaleString()}`}
            subtitle={`${metrics.fullyPaidInvoices ?? 0} invoices cleared in full`}
            icon={CheckCircle2}
            color="emerald"
          />
        </Card3D>
        <Card3D maxTilt={6}>
          <StatCard
            title="Outstanding Dues"
            value={`₹${(metrics.totalOutstanding ?? 0).toLocaleString()}`}
            subtitle={`${metrics.unpaidInvoices ?? 0} pending student dues`}
            icon={AlertCircle}
            color="amber"
          />
        </Card3D>
      </div>

      {/* Recent Payments Stream */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Payment Transactions</h3>
            <p className="text-xs text-slate-500">Real-time payment gateway and bank transfer reconciliation</p>
          </div>
          <Link
            to="/fees"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Full Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No recent payment transactions.</p>
          ) : (
            payments.map((pmt: any) => (
              <div key={pmt._id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">Receipt #{pmt.receiptNumber}</span>
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {pmt.paymentReference}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Student ID: <span className="font-mono">{pmt.studentId?.studentNumber || 'Student'}</span> •
                      Method: <span className="uppercase font-semibold">{pmt.paymentMethod}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-700">
                    +₹{pmt.amount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                    {new Date(pmt.receivedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
