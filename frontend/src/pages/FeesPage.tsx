import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { StudentInvoice } from '../types';
import { CreditCard, Plus, Receipt, DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FeesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<StudentInvoice[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const { hasRole, user } = useAuth();
  const canManageFees = hasRole('accounts', 'admin', 'super_admin');
  const isStudent = user?.roles.includes('student');

  const [invoiceForm, setInvoiceForm] = useState({
    studentId: '',
    academicYearId: '',
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    tuitionFee: 65000,
    labFee: 10000,
    libraryFee: 5000,
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'bank_transfer',
    paymentReference: '',
    notes: '',
  });

  const fetchInvoices = () => {
    setIsLoading(true);
    const endpoint = isStudent ? `/fees/students/${user?.profile?._id || user?._id}/invoices` : '/fees/invoices';
    api
      .get(endpoint)
      .then((res) => setInvoices(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
    if (canManageFees) {
      Promise.all([api.get('/students?limit=100'), api.get('/academic/academic-years')]).then(
        ([sRes, ayRes]) => {
          setStudents(sRes.data.data);
          setAcademicYears(ayRes.data.data);
          if (sRes.data.data.length && ayRes.data.data.length) {
            setInvoiceForm((prev) => ({
              ...prev,
              studentId: sRes.data.data[0]._id,
              academicYearId: ayRes.data.data[0]._id,
            }));
          }
        }
      );
    }
  }, []);

  const handleGenerateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/fees/invoices', {
        studentId: invoiceForm.studentId,
        academicYearId: invoiceForm.academicYearId,
        dueDate: invoiceForm.dueDate,
        feeComponents: [
          { name: 'Tuition Fee', amount: Number(invoiceForm.tuitionFee) },
          { name: 'Laboratory Fee', amount: Number(invoiceForm.labFee) },
          { name: 'Library Fee', amount: Number(invoiceForm.libraryFee) },
        ],
      });
      setIsInvoiceModalOpen(false);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleOpenPayment = (inv: StudentInvoice) => {
    setSelectedInvoice(inv);
    setPaymentForm({
      amount: inv.balanceAmount,
      paymentMethod: 'bank_transfer',
      paymentReference: '',
      notes: '',
    });
    setIsPaymentModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await api.post('/fees/payments', {
        invoiceId: selectedInvoice._id,
        amount: Number(paymentForm.amount),
        paymentMethod: paymentForm.paymentMethod,
        paymentReference: paymentForm.paymentReference || undefined,
        notes: paymentForm.notes,
      });
      setIsPaymentModalOpen(false);
      alert(`Payment recorded successfully! Receipt: ${res.data.data.receiptNumber}`);
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const columns: Column<StudentInvoice>[] = [
    {
      header: 'Invoice No.',
      accessor: 'invoiceNumber',
      className: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Student Info',
      render: (inv) => (
        <div>
          <span className="font-semibold text-slate-900">
            {inv.studentId?.firstName} {inv.studentId?.lastName}
          </span>
          <p className="text-xs text-slate-400 font-mono">{inv.studentId?.studentNumber}</p>
        </div>
      ),
    },
    {
      header: 'Total Amount',
      render: (inv) => <span className="font-bold text-slate-900">₹{inv.totalAmount.toLocaleString()}</span>,
    },
    {
      header: 'Paid Amount',
      render: (inv) => <span className="text-emerald-700 font-medium">₹{inv.paidAmount.toLocaleString()}</span>,
    },
    {
      header: 'Outstanding Balance',
      render: (inv) => (
        <span className={`font-extrabold ${inv.balanceAmount === 0 ? 'text-slate-400' : 'text-amber-700'}`}>
          ₹{inv.balanceAmount.toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (inv) => {
        const variants: Record<string, any> = {
          paid: 'success',
          partially_paid: 'warning',
          unpaid: 'danger',
          overdue: 'danger',
        };
        return <Badge variant={variants[inv.status] || 'neutral'}>{inv.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Action',
      render: (inv) => (
        <div>
          {canManageFees && inv.balanceAmount > 0 && (
            <button
              onClick={() => handleOpenPayment(inv)}
              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
            >
              Record Payment
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Tuition Fee Ledger & Invoicing</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Student fee structures, invoice disbursements, and verified payment transactions
          </p>
        </div>
        {canManageFees && (
          <button
            onClick={() => setIsInvoiceModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Invoice</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={invoices} isLoading={isLoading} />

      {/* Generate Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Generate Student Fee Invoice">
        <form onSubmit={handleGenerateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Student *</label>
            <select
              value={invoiceForm.studentId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, studentId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.studentNumber} — {s.firstName} {s.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year *</label>
              <select
                value={invoiceForm.academicYearId}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, academicYearId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {academicYears.map((ay) => (
                  <option key={ay._id} value={ay._id}>
                    {ay.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fee Components (INR)</p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-600">Tuition Fee</label>
                <input
                  type="number"
                  min={0}
                  value={invoiceForm.tuitionFee}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, tuitionFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Laboratory Fee</label>
                <input
                  type="number"
                  min={0}
                  value={invoiceForm.labFee}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, labFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600">Library Fee</label>
                <input
                  type="number"
                  min={0}
                  value={invoiceForm.libraryFee}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, libraryFee: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white"
                />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-bold text-slate-900">
              <span>Total Invoice Amount:</span>
              <span>
                ₹
                {(
                  Number(invoiceForm.tuitionFee) +
                  Number(invoiceForm.labFee) +
                  Number(invoiceForm.libraryFee)
                ).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Payment for ${selectedInvoice.invoiceNumber}`}
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between">
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedInvoice.studentId?.firstName} {selectedInvoice.studentId?.lastName}
                </p>
                <p className="text-slate-500 font-mono">{selectedInvoice.studentId?.studentNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Outstanding:</span>
                <p className="text-sm font-bold text-amber-700">
                  ₹{selectedInvoice.balanceAmount.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  max={selectedInvoice.balanceAmount}
                  required
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="online">Online / UPI</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Demand Draft / Cheque</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transaction Reference No.</label>
              <input
                type="text"
                placeholder="e.g. UTR-9823746198 or UPI-Ref"
                value={paymentForm.paymentReference}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentReference: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
              >
                Issue Receipt & Clear Dues
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
