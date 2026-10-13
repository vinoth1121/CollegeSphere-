import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Programme } from '../types';
import { GraduationCap, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProgrammesPage: React.FC = () => {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    programmeCode: '',
    programmeName: '',
    departmentId: '',
    degreeType: 'UG',
    durationSemesters: 8,
  });

  const { hasRole } = useAuth();
  const canCreate = hasRole('admin', 'super_admin');

  const fetchProgrammes = () => {
    setIsLoading(true);
    api
      .get('/academic/programmes')
      .then((res) => setProgrammes(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchProgrammes();
    api.get('/academic/departments').then((res) => {
      setDepartments(res.data.data);
      if (res.data.data.length) {
        setFormData((prev) => ({ ...prev, departmentId: res.data.data[0]._id }));
      }
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/academic/programmes', formData);
      setIsModalOpen(false);
      fetchProgrammes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create programme');
    }
  };

  const columns: Column<Programme>[] = [
    {
      header: 'Code',
      accessor: 'programmeCode',
      className: 'font-mono font-bold text-brand-700',
    },
    {
      header: 'Programme Name',
      accessor: 'programmeName',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Department',
      render: (p) => <span>{p.departmentId?.departmentName || '-'}</span>,
    },
    {
      header: 'Degree Type',
      render: (p) => <Badge variant="info">{p.degreeType}</Badge>,
    },
    {
      header: 'Semesters',
      accessor: 'durationSemesters',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Programmes & Degrees</h2>
          <p className="text-xs text-slate-500 mt-0.5">Degree curriculums and semester durations</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Programme</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={programmes} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Degree Programme">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. BTECH-CSE"
                value={formData.programmeCode}
                onChange={(e) => setFormData({ ...formData, programmeCode: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Degree Type *</label>
              <select
                value={formData.degreeType}
                onChange={(e) => setFormData({ ...formData, degreeType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="UG">Undergraduate (UG)</option>
                <option value="PG">Postgraduate (PG)</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="PHD">Doctorate (Ph.D.)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Programme Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Bachelor of Technology in Computer Science"
              value={formData.programmeName}
              onChange={(e) => setFormData({ ...formData, programmeName: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Semesters) *</label>
              <input
                type="number"
                min={1}
                max={12}
                required
                value={formData.durationSemesters}
                onChange={(e) => setFormData({ ...formData, durationSemesters: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
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
              Save Programme
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
