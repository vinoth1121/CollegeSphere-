import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Examination } from '../types';
import { Award, Plus, Edit3, CheckCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ExaminationsPage: React.FC = () => {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [marksEntries, setMarksEntries] = useState<any[]>([]);

  const { hasRole } = useAuth();
  const canSchedule = hasRole('exam_officer', 'admin', 'super_admin');
  const canEnterMarks = hasRole('faculty', 'exam_officer', 'admin', 'super_admin');
  const canVerify = hasRole('hod', 'exam_officer', 'admin', 'super_admin');
  const canPublish = hasRole('exam_officer', 'admin', 'super_admin');

  const [formData, setFormData] = useState({
    courseOfferingId: '',
    examinationName: '',
    examinationType: 'midterm',
    examDate: new Date().toISOString().split('T')[0],
    maximumMarks: 50,
    passMarks: 20,
    weightagePercentage: 25,
  });

  const fetchExams = () => {
    setIsLoading(true);
    api
      .get('/examinations')
      .then((res) => setExaminations(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchExams();
    api.get('/academic/course-offerings').then((res) => {
      setOfferings(res.data.data);
      if (res.data.data.length) {
        setFormData((prev) => ({ ...prev, courseOfferingId: res.data.data[0]._id }));
      }
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/examinations', formData);
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule examination');
    }
  };

  const handleOpenMarksEntry = async (exam: Examination) => {
    setSelectedExam(exam);
    try {
      const res = await api.get(`/examinations/${exam._id}/results`);
      const existingResults = res.data.data.results || [];

      // Fetch enrolled students for offering
      const enrRes = await api.get(`/academic/enrollments?courseOfferingId=${exam.courseOfferingId._id}`);
      const students = enrRes.data.data;

      const entries = students.map((enr: any) => {
        const found = existingResults.find((r: any) => r.studentId?._id === enr.studentId?._id);
        return {
          studentId: enr.studentId?._id,
          studentNumber: enr.studentId?.studentNumber,
          studentName: `${enr.studentId?.firstName} ${enr.studentId?.lastName}`,
          marksObtained: found ? found.marksObtained : 0,
          grade: found ? found.grade : '',
          remarks: found ? found.remarks || '' : '',
        };
      });

      setMarksEntries(entries);
      setIsMarksModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load examination results');
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    try {
      await api.post(`/examinations/${selectedExam._id}/results`, {
        marksList: marksEntries.map((m) => ({
          studentId: m.studentId,
          marksObtained: Number(m.marksObtained),
          remarks: m.remarks,
        })),
      });
      setIsMarksModalOpen(false);
      alert('Marks saved successfully!');
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save marks');
    }
  };

  const handleVerify = async (examId: string) => {
    try {
      await api.post(`/examinations/${examId}/verify`);
      alert('Examination marks verified!');
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handlePublish = async (examId: string) => {
    try {
      await api.post(`/examinations/${examId}/publish`);
      alert('Examination results published to students!');
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Publishing failed');
    }
  };

  const columns: Column<Examination>[] = [
    {
      header: 'Assessment Title',
      render: (e) => (
        <div>
          <h4 className="font-semibold text-slate-900">{e.examinationName}</h4>
          <p className="text-xs text-slate-500">
            {e.courseOfferingId?.courseId?.courseCode} — {e.courseOfferingId?.courseId?.courseName}
          </p>
        </div>
      ),
    },
    {
      header: 'Date',
      render: (e) => <span>{new Date(e.examDate).toLocaleDateString()}</span>,
    },
    {
      header: 'Max / Pass',
      render: (e) => (
        <span className="font-semibold text-slate-800">
          {e.maximumMarks} / {e.passMarks}
        </span>
      ),
    },
    {
      header: 'Weightage',
      render: (e) => <span>{e.weightagePercentage || 25}%</span>,
    },
    {
      header: 'Status',
      render: (e) => {
        const variants: Record<string, any> = {
          scheduled: 'neutral',
          draft_marks: 'warning',
          verified: 'info',
          published: 'success',
        };
        return <Badge variant={variants[e.status] || 'neutral'}>{e.status.replace('_', ' ')}</Badge>;
      },
    },
    {
      header: 'Actions',
      render: (e) => (
        <div className="flex items-center space-x-1.5">
          {canEnterMarks && e.status !== 'published' && (
            <button
              onClick={() => handleOpenMarksEntry(e)}
              title="Enter/Edit Marks"
              className="p-1.5 hover:bg-slate-100 rounded text-brand-600 hover:text-brand-700"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          {canVerify && e.status === 'draft_marks' && (
            <button
              onClick={() => handleVerify(e._id)}
              title="Verify Marks"
              className="p-1.5 hover:bg-slate-100 rounded text-blue-600 hover:text-blue-700"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
          {canPublish && e.status === 'verified' && (
            <button
              onClick={() => handlePublish(e._id)}
              title="Publish Results to Students"
              className="p-1.5 hover:bg-slate-100 rounded text-emerald-600 hover:text-emerald-700"
            >
              <Globe className="w-4 h-4" />
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
          <h2 className="text-xl font-bold text-slate-900">Examinations & Assessment Governance</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure assessments, record marks, and execute verification/publication workflows
          </p>
        </div>
        {canSchedule && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Examination</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={examinations} isLoading={isLoading} />

      {/* Schedule Exam Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Examination">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Offering *</label>
            <select
              value={formData.courseOfferingId}
              onChange={(e) => setFormData({ ...formData, courseOfferingId: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {offerings.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.courseId?.courseCode} — {o.courseId?.courseName} ({o.classId?.className})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Midterm Assessment 1"
                value={formData.examinationName}
                onChange={(e) => setFormData({ ...formData, examinationName: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assessment Type *</label>
              <select
                value={formData.examinationType}
                onChange={(e) => setFormData({ ...formData, examinationType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="internal">Internal Test</option>
                <option value="midterm">Midterm Examination</option>
                <option value="final">Final Semester Exam</option>
                <option value="practical">Lab Practical</option>
                <option value="assignment">Assignment Evaluation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Marks *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.maximumMarks}
                onChange={(e) => setFormData({ ...formData, maximumMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Marks *</label>
              <input
                type="number"
                min={0}
                required
                value={formData.passMarks}
                onChange={(e) => setFormData({ ...formData, passMarks: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weightage (%) *</label>
              <input
                type="number"
                min={1}
                max={100}
                required
                value={formData.weightagePercentage}
                onChange={(e) => setFormData({ ...formData, weightagePercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Examination Date *</label>
            <input
              type="date"
              required
              value={formData.examDate}
              onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
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
              Schedule
            </button>
          </div>
        </form>
      </Modal>

      {/* Marks Entry Grade Sheet Modal */}
      {selectedExam && (
        <Modal
          isOpen={isMarksModalOpen}
          onClose={() => setIsMarksModalOpen(false)}
          title={`Marks Entry — ${selectedExam.examinationName} (Max: ${selectedExam.maximumMarks})`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {selectedExam.courseOfferingId?.courseId?.courseCode} —{' '}
                  {selectedExam.courseOfferingId?.courseId?.courseName}
                </p>
                <p className="text-slate-500">
                  Maximum Marks: {selectedExam.maximumMarks} • Passing Marks: {selectedExam.passMarks}
                </p>
              </div>
              <Badge variant="warning">Status: {selectedExam.status}</Badge>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {marksEntries.map((m, idx) => (
                <div key={m.studentId} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div className="w-1/2">
                    <span className="font-mono font-bold text-slate-900">{m.studentNumber}</span>
                    <p className="font-medium text-slate-700 mt-0.5">{m.studentName}</p>
                  </div>
                  <div className="flex items-center space-x-3 w-1/2 justify-end">
                    <div className="flex items-center space-x-1.5">
                      <label className="text-slate-500 font-medium">Marks:</label>
                      <input
                        type="number"
                        min={0}
                        max={selectedExam.maximumMarks}
                        value={m.marksObtained}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setMarksEntries((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, marksObtained: val } : item))
                          );
                        }}
                        className="w-20 px-2.5 py-1 text-center font-bold text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsMarksModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMarks}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Save Marks Sheet
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
