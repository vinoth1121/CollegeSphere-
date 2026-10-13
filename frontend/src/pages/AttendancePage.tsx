import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { AttendanceSession } from '../types';
import { CalendarCheck2, Plus, CheckSquare, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AttendancePage: React.FC = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [offerings, setOfferings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRosterModalOpen, setIsRosterModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [rosterRecords, setRosterRecords] = useState<any[]>([]);

  const { hasRole, user } = useAuth();
  const canRecord = hasRole('faculty', 'hod', 'admin', 'super_admin');

  const [formData, setFormData] = useState({
    courseOfferingId: '',
    facultyId: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    topic: '',
  });

  const fetchSessions = () => {
    setIsLoading(true);
    api
      .get('/attendance/sessions')
      .then((res) => setSessions(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchSessions();
    api.get('/academic/course-offerings').then((res) => {
      setOfferings(res.data.data);
      if (res.data.data.length) {
        const first = res.data.data[0];
        setFormData((prev) => ({
          ...prev,
          courseOfferingId: first._id,
          facultyId: first.facultyIds?.[0]?._id || '',
        }));
      }
    });
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/attendance/sessions', formData);
      setIsModalOpen(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create attendance session');
    }
  };

  const handleOpenRoster = async (session: AttendanceSession) => {
    try {
      const res = await api.get(`/attendance/sessions/${session._id}`);
      setSelectedSession(res.data.data.session);

      // Load enrolled students for this course offering to prepare roster
      const enrRes = await api.get(`/academic/enrollments?courseOfferingId=${session.courseOfferingId._id}`);
      const enrolledStudents = enrRes.data.data;
      const existingRecords = res.data.data.records || [];

      const initialRoster = enrolledStudents.map((enr: any) => {
        const found = existingRecords.find((r: any) => r.studentId?._id === enr.studentId?._id);
        return {
          studentId: enr.studentId?._id,
          studentNumber: enr.studentId?.studentNumber,
          studentName: `${enr.studentId?.firstName} ${enr.studentId?.lastName}`,
          status: found ? found.status : 'present',
        };
      });

      setRosterRecords(initialRoster);
      setIsRosterModalOpen(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to load session roster');
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setRosterRecords((prev) =>
      prev.map((r) => (r.studentId === studentId ? { ...r, status: newStatus } : r))
    );
  };

  const handleSaveRoster = async () => {
    if (!selectedSession) return;
    try {
      await api.post(`/attendance/sessions/${selectedSession._id}/records`, {
        records: rosterRecords.map((r) => ({ studentId: r.studentId, status: r.status })),
      });
      setIsRosterModalOpen(false);
      alert('Attendance saved successfully!');
      fetchSessions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    }
  };

  const columns: Column<AttendanceSession>[] = [
    {
      header: 'Course Code & Name',
      render: (s) => (
        <div>
          <span className="font-mono font-bold text-brand-700">
            {s.courseOfferingId?.courseId?.courseCode}
          </span>
          <p className="font-semibold text-slate-800">
            {s.courseOfferingId?.courseId?.courseName}
          </p>
        </div>
      ),
    },
    {
      header: 'Date & Time',
      render: (s) => (
        <div>
          <p className="font-medium text-slate-900">
            {new Date(s.sessionDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-400">
            {s.startTime} - {s.endTime}
          </p>
        </div>
      ),
    },
    {
      header: 'Topic / Syllabus',
      accessor: 'topic',
    },
    {
      header: 'Faculty Member',
      render: (s) => (
        <span>
          {s.facultyId?.firstName} {s.facultyId?.lastName}
        </span>
      ),
    },
    {
      header: 'Status',
      render: (s) => (
        <Badge variant={s.sessionStatus === 'finalized' ? 'success' : 'neutral'}>
          {s.sessionStatus}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (s) => (
        <button
          onClick={() => handleOpenRoster(s)}
          className="flex items-center space-x-1 px-3 py-1 text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Mark Attendance</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Attendance Registry & Sessions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log class sessions, mark rosters, and monitor student compliance
          </p>
        </div>
        {canRecord && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Session</span>
          </button>
        )}
      </div>

      <DataTable columns={columns} data={sessions} isLoading={isLoading} />

      {/* Create Session Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Class Attendance Session">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Offering *</label>
            <select
              value={formData.courseOfferingId}
              onChange={(e) => {
                const off = offerings.find((o) => o._id === e.target.value);
                setFormData({
                  ...formData,
                  courseOfferingId: e.target.value,
                  facultyId: off?.facultyIds?.[0]?._id || '',
                });
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              {offerings.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.courseId?.courseCode} — {o.courseId?.courseName} ({o.classId?.className})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Session Date *</label>
              <input
                type="date"
                required
                value={formData.sessionDate}
                onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Lecture Topic / Notes</label>
            <input
              type="text"
              placeholder="e.g. Relational Calculus & SQL Join Optimizations"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
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
              Start Session
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Attendance Roster Modal */}
      {selectedSession && (
        <Modal
          isOpen={isRosterModalOpen}
          onClose={() => setIsRosterModalOpen(false)}
          title={`Attendance Roster — ${selectedSession.courseOfferingId?.courseId?.courseCode}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex justify-between">
              <div>
                <p className="font-semibold text-slate-800">
                  {selectedSession.courseOfferingId?.courseId?.courseName}
                </p>
                <p className="text-slate-500">
                  Date: {new Date(selectedSession.sessionDate).toLocaleDateString()} • Time:{' '}
                  {selectedSession.startTime} - {selectedSession.endTime}
                </p>
              </div>
              <Badge variant="info">Enrolled Students: {rosterRecords.length}</Badge>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {rosterRecords.map((r) => (
                <div key={r.studentId} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{r.studentNumber}</span>
                    <span className="ml-2 font-medium text-slate-700">{r.studentName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(r.studentId, status)}
                        className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors ${
                          r.status === status
                            ? status === 'present'
                              ? 'bg-emerald-600 text-white'
                              : status === 'absent'
                              ? 'bg-rose-600 text-white'
                              : status === 'late'
                              ? 'bg-amber-600 text-white'
                              : 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsRosterModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoster}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Save Attendance Records
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
