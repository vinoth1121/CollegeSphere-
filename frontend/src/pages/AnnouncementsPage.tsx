import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Announcement } from '../types';
import { Bell, Plus, Calendar, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    audience: 'all',
  });

  const { hasRole } = useAuth();
  const canPublish = hasRole('admin', 'super_admin', 'hod', 'faculty');

  const fetchAnnouncements = () => {
    setIsLoading(true);
    api
      .get('/announcements')
      .then((res) => setAnnouncements(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements', {
        title: formData.title,
        body: formData.body,
        audience: [formData.audience],
      });
      setIsModalOpen(false);
      setFormData({ title: '', body: '', audience: 'all' });
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to publish announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Institutional Announcements</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Circulars, examination notices, and campus-wide notifications
          </p>
        </div>
        {canPublish && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publish Notice</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-600">No active circulars</p>
          <p className="text-xs text-slate-400 mt-0.5">All official notifications have expired or been archived</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {announcements.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-brand-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="info" className="capitalize">
                    Audience: {item.audience?.join(', ') || 'All'}
                  </Badge>
                  <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">
                  {item.body}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>Author: {item.publishedBy?.email || 'Registrar'}</span>
                </span>
                <span className="text-emerald-600 font-medium font-mono text-[10px]">Verified Circular</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Publish Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Publish Official Circular">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. End Semester Practical Examination Timetable"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience *</label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="all">Campus-Wide (Everyone)</option>
              <option value="students">Students Only</option>
              <option value="faculty">Faculty Only</option>
              <option value="hod">HODs Only</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Circular Content *</label>
            <textarea
              rows={4}
              required
              placeholder="Type notification text..."
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
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
              Publish Now
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
