import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Department } from '../types';
import { Building2, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ departmentCode: '', departmentName: '' });

  const { hasRole } = useAuth();
  const canCreate = hasRole('admin', 'super_admin');

  const fetchDepartments = () => {
    setIsLoading(true);
    api
      .get('/academic/departments')
      .then((res) => setDepartments(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/academic/departments', formData);
      setIsModalOpen(false);
      setFormData({ departmentCode: '', departmentName: '' });
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department');
    }
  };

  const columns: Column<Department>[] = [
    {
      header: 'Code',
      accessor: 'departmentCode',
      className: 'font-mono font-bold text-brand-700',
    },
    {
      header: 'Department Name',
      accessor: 'departmentName',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Head of Department',
      render: (d) => <span>{d.hodUserId?.email || 'Not Assigned'}</span>,
    },
    {
      header: 'Status',
      render: (d) => <Badge variant={d.isActive ? 'success' : 'neutral'}>{d.isActive ? 'Active' : 'Inactive'}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Departments</h2>
          <p className="text-xs text-slate-500 mt-0.5">Faculty divisions and disciplinary branches</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={departments} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Academic Department">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. CSE, ECE, MECH"
              value={formData.departmentCode}
              onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Computer Science & Engineering"
              value={formData.departmentName}
              onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Save Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
