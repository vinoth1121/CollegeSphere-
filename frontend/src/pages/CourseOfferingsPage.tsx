import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { CourseOffering } from '../types';
import { BookMarked, UserPlus, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CourseOfferingsPage: React.FC = () => {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const { hasRole } = useAuth();
  const canManage = hasRole('admin', 'super_admin', 'hod');

  const [formData, setFormData] = useState({
    courseId: '',
    classId: '',
    academicYearId: '',
    semesterId: '',
    facultyId: '',
    capacity: 60,
  });

  const fetchOfferings = () => {
    setIsLoading(true);
    api
      .get('/academic/course-offerings')
      .then((res) => setOfferings(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOfferings();

    Promise.all([
      api.get('/academic/courses'),
      api.get('/academic/classes'),
      api.get('/faculty'),
      api.get('/students?limit=100'),
      api.get('/academic/academic-years'),
      api.get('/academic/semesters'),
    ]).then(([cRes, clRes, fRes, sRes, ayRes, semRes]) => {
      setCourses(cRes.data.data);
      setClasses(clRes.data.data);
      setFaculty(fRes.data.data);
      setStudents(sRes.data.data);
      setAcademicYears(ayRes.data.data);
      setSemesters(semRes.data.data);

      if (cRes.data.data.length && clRes.data.data.length) {
        setFormData({
          courseId: cRes.data.data[0]._id,
          classId: clRes.data.data[0]._id,
          academicYearId: ayRes.data.data[0]?._id || '',
          semesterId: semRes.data.data[0]?._id || '',
          facultyId: fRes.data.data[0]?._id || '',
          capacity: 60,
        });
      }
      if (sRes.data.data.length) {
        setSelectedStudentId(sRes.data.data[0]._id);
      }
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/academic/course-offerings', {
        courseId: formData.courseId,
        classId: formData.classId,
        academicYearId: formData.academicYearId,
        semesterId: formData.semesterId,
        facultyIds: formData.facultyId ? [formData.facultyId] : [],
        capacity: formData.capacity,
        status: 'open',
      });
      setIsModalOpen(false);
      fetchOfferings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule course offering');
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffering || !selectedStudentId) return;
    try {
      await api.post('/academic/enrollments', {
        courseOfferingId: selectedOffering._id,
        studentId: selectedStudentId,
      });
      setIsEnrollModalOpen(false);
      fetchOfferings();
      alert('Student successfully enrolled in course offering!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to enroll student');
    }
  };

  const columns: Column<CourseOffering>[] = [
    {
      header: 'Course Code & Name',
      render: (o) => (
        <div>
          <span className="font-mono font-bold text-brand-700">{o.courseId?.courseCode}</span>
          <p className="font-semibold text-slate-800">{o.courseId?.courseName}</p>
        </div>
      ),
    },
    {
      header: 'Class / Batch',
      render: (o) => <span>{o.classId?.className || 'Batch 1'}</span>,
    },
    {
      header: 'Assigned Faculty',
      render: (o) => (
        <span>
          {o.facultyIds && o.facultyIds.length > 0
            ? `${o.facultyIds[0].firstName} ${o.facultyIds[0].lastName}`
            : 'Unassigned'}
        </span>
      ),
    },
    {
      header: 'Enrollment Capacity',
      render: (o) => (
        <span className="font-medium text-slate-700">
          <strong className="text-slate-900">{o.enrolledCount}</strong> / {o.capacity}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (o) => <Badge variant={o.status === 'open' ? 'success' : 'info'}>{o.status}</Badge>,
    },
    {
      header: 'Actions',
      render: (o) => (
        <button
          onClick={() => {
            setSelectedOffering(o);
            setIsEnrollModalOpen(true);
          }}
          className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
        >
          Enroll Student
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Term Course Offerings & Schedules</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active courses offered to classes and assigned teaching faculty
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Offering</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={offerings} isLoading={isLoading} />

      {/* Schedule Offering Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Term Course Offering">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Course *</label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.courseCode} — {c.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {classes.map((cl) => (
                  <option key={cl._id} value={cl._id}>
                    {cl.className} (Sec {cl.section})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Faculty *</label>
              <select
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {faculty.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.firstName} {f.lastName} ({f.employeeNumber})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity *</label>
            <input
              type="number"
              min={1}
              max={300}
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
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
              Schedule Offering
            </button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      {selectedOffering && (
        <Modal
          isOpen={isEnrollModalOpen}
          onClose={() => setIsEnrollModalOpen(false)}
          title={`Enroll Student into ${selectedOffering.courseId?.courseCode}`}
        >
          <form onSubmit={handleEnrollSubmit} className="space-y-4">
            <p className="text-xs text-slate-500">
              Select a student to enroll into <strong>{selectedOffering.courseId?.courseName}</strong> (Current
              roster: {selectedOffering.enrolledCount}/{selectedOffering.capacity}).
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student *</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.studentNumber} — {s.firstName} {s.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Confirm Enrollment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
