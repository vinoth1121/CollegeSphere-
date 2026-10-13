import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Course } from '../types';
import { BookOpen, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: 4,
    courseType: 'core',
    departmentId: '',
  });

  const { hasRole } = useAuth();
  const canCreate = hasRole('admin', 'super_admin', 'hod');

  const fetchCourses = () => {
    setIsLoading(true);
    api
      .get('/academic/courses')
      .then((res) => setCourses(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCourses();
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
      await api.post('/academic/courses', formData);
      setIsModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create course');
    }
  };

  const columns: Column<Course>[] = [
    {
      header: 'Course Code',
      accessor: 'courseCode',
      className: 'font-mono font-bold text-brand-700',
    },
    {
      header: 'Course Title',
      accessor: 'courseName',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Department',
      render: (c) => <span>{c.departmentId?.departmentName || '-'}</span>,
    },
    {
      header: 'Credits',
      accessor: 'credits',
      className: 'font-bold text-slate-900',
    },
    {
      header: 'Type',
      render: (c) => <Badge variant="info">{c.courseType.toUpperCase()}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Course Catalog & Syllabus</h2>
          <p className="text-xs text-slate-500 mt-0.5">Approved academic subjects and credit structures</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={courses} isLoading={isLoading} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Course to Catalog">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. CS501"
                value={formData.courseCode}
                onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credits *</label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Distributed Operating Systems"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Type *</label>
              <select
                value={formData.courseType}
                onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="core">Core Theory</option>
                <option value="elective">Elective</option>
                <option value="lab">Laboratory Practical</option>
                <option value="project">Capstone Project</option>
              </select>
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
              Save Course
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
