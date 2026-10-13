import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Student } from '../types';
import { Plus, UserPlus, Eye, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const { hasRole } = useAuth();
  const canAdmit = hasRole('admin', 'super_admin');

  // Form state
  const [formData, setFormData] = useState({
    studentNumber: '',
    firstName: '',
    lastName: '',
    gender: 'male',
    email: '',
    phone: '',
    departmentId: '',
    programmeId: '',
    classId: '',
    admissionAcademicYearId: '',
    currentSemesterId: '',
  });

  const fetchStudents = (page = 1, searchQuery = search) => {
    setIsLoading(true);
    api
      .get(`/students?page=${page}&limit=15&search=${encodeURIComponent(searchQuery)}`)
      .then((res) => {
        setStudents(res.data.data);
        if (res.data.meta) {
          setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages });
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchStudents(1);

    // Load dropdown prerequisites
    Promise.all([
      api.get('/academic/departments'),
      api.get('/academic/programmes'),
      api.get('/academic/classes'),
      api.get('/academic/academic-years'),
      api.get('/academic/semesters'),
    ]).then(([dRes, pRes, cRes, ayRes, sRes]) => {
      setDepartments(dRes.data.data);
      setProgrammes(pRes.data.data);
      setClasses(cRes.data.data);
      setAcademicYears(ayRes.data.data);
      setSemesters(sRes.data.data);

      if (dRes.data.data.length && pRes.data.data.length) {
        setFormData((prev) => ({
          ...prev,
          departmentId: dRes.data.data[0]._id,
          programmeId: pRes.data.data[0]._id,
          classId: cRes.data.data[0]?._id || '',
          admissionAcademicYearId: ayRes.data.data[0]?._id || '',
          currentSemesterId: sRes.data.data[0]?._id || '',
        }));
      }
    });
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    fetchStudents(1, val);
  };

  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', {
        studentNumber: formData.studentNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        departmentId: formData.departmentId,
        programmeId: formData.programmeId,
        classId: formData.classId || undefined,
        admissionAcademicYearId: formData.admissionAcademicYearId,
        currentSemesterId: formData.currentSemesterId,
        contact: {
          email: formData.email,
          phone: formData.phone,
        },
      });
      setIsModalOpen(false);
      fetchStudents(1);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to admit student');
    }
  };

  const handleViewStudent = (student: Student) => {
    api.get(`/students/${student._id}`).then((res) => {
      setSelectedStudent(res.data.data);
    });
  };

  const columns: Column<Student>[] = [
    {
      header: 'Roll Number',
      accessor: 'studentNumber',
      className: 'font-mono font-bold text-brand-700',
    },
    {
      header: 'Full Name',
      render: (s) => (
        <div>
          <p className="font-semibold text-slate-900">
            {s.firstName} {s.lastName}
          </p>
          <p className="text-xs text-slate-400">{s.contact?.email}</p>
        </div>
      ),
    },
    {
      header: 'Programme & Dept',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-800">{s.programmeId?.programmeCode || '-'}</p>
          <p className="text-[11px] text-slate-400">{s.departmentId?.departmentCode || '-'}</p>
        </div>
      ),
    },
    {
      header: 'Class / Section',
      render: (s) => <span>{s.classId?.className || 'Batch 1'}</span>,
    },
    {
      header: 'Status',
      render: (s) => (
        <Badge variant={s.studentStatus === 'active' ? 'success' : 'neutral'}>
          {s.studentStatus}
        </Badge>
      ),
    },
    {
      header: 'Action',
      render: (s) => (
        <button
          onClick={() => handleViewStudent(s)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-brand-600 transition-colors"
          title="View Student File"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Information System (SIS)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Directory of admitted undergraduate and postgraduate students
          </p>
        </div>
        {canAdmit && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        searchPlaceholder="Search roll number, name, email..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={(p) => fetchStudents(p)}
      />

      {/* Admission Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Student Admission Form">
        <form onSubmit={handleAdmitSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Roll No. *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2025CSE045"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
                placeholder="student@collegesphere.edu"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                placeholder="+91-9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Programme *</label>
              <select
                value={formData.programmeId}
                onChange={(e) => setFormData({ ...formData, programmeId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {programmes.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.programmeName}
                  </option>
                ))}
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
              Admit Student
            </button>
          </div>
        </form>
      </Modal>

      {/* Student View Drawer Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title={`Student Profile — ${selectedStudent.studentNumber}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h4>
                <p className="text-slate-500 mt-0.5">{selectedStudent.contact?.email}</p>
              </div>
              <Badge variant="success">{selectedStudent.studentStatus}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Department</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.departmentId?.departmentName}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Programme</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.programmeId?.programmeName}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Attendance Rate</p>
                <p className="font-semibold text-slate-800 mt-0.5">
                  {selectedStudent.metrics?.attendancePercentage}%
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 bg-white">
                <p className="text-slate-400 font-medium">Outstanding Dues</p>
                <p className="font-semibold text-amber-700 mt-0.5">
                  ₹{(selectedStudent.metrics?.totalOutstandingDues || 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
