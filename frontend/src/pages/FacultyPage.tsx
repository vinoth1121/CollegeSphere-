import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Faculty } from '../types';
import { UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FacultyPage: React.FC = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const { hasRole } = useAuth();
  const canCreate = hasRole('admin', 'super_admin');

  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: '',
    designation: 'Assistant Professor',
    qualification: 'M.Tech',
    isHod: false,
  });

  const fetchFaculty = (page = 1, searchQuery = search) => {
    setIsLoading(true);
    api
      .get(`/faculty?page=${page}&limit=15&search=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        setFaculty(res.data.data);
        if (res.data.meta) {
          setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages });
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchFaculty(1);
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
      await api.post('/faculty', {
        employeeNumber: formData.employeeNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        designation: formData.designation,
        qualification: formData.qualification,
        departmentId: formData.departmentId,
        isHod: formData.isHod,
        contact: {
          email: formData.email,
          phone: formData.phone,
        },
      });
      setIsModalOpen(false);
      fetchFaculty(1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to onboard faculty member');
    }
  };

  const columns: Column<Faculty>[] = [
    {
      header: 'Employee ID',
      accessor: 'employeeNumber',
      className: 'font-mono font-bold text-slate-800',
    },
    {
      header: 'Faculty Name',
      render: (f) => (
        <div>
          <p className="font-semibold text-slate-900">
            {f.firstName} {f.lastName}
          </p>
          <p className="text-xs text-slate-400">{f.contact?.email}</p>
        </div>
      ),
    },
    {
      header: 'Department',
      render: (f) => <span>{f.departmentId?.departmentName || 'General'}</span>,
    },
    {
      header: 'Designation',
      render: (f) => <Badge variant="info">{f.designation}</Badge>,
    },
    {
      header: 'Status',
      render: (f) => (
        <Badge variant={f.employmentStatus === 'active' ? 'success' : 'neutral'}>
          {f.employmentStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Faculty Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Professors, Associate Professors, and Lecturers
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Faculty</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={faculty}
        isLoading={isLoading}
        searchPlaceholder="Search employee ID, name, email..."
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          fetchFaculty(1, v);
        }}
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={(p) => fetchFaculty(p)}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Onboard Faculty Member">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Employee ID *</label>
              <input
                type="text"
                required
                placeholder="e.g. FAC-CSE-005"
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
              <input
                type="text"
                required
                placeholder="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
              <input
                type="text"
                required
                placeholder="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                placeholder="faculty@collegesphere.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
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
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isHod"
              checked={formData.isHod}
              onChange={(e) => setFormData({ ...formData, isHod: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isHod" className="text-xs font-medium text-slate-700">
              Grant Head of Department (HOD) Administrative Role
            </label>
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
              Onboard Staff
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
