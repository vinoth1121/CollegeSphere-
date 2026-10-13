import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DataTable, Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { AuditLog } from '../types';
import { ShieldCheck, Eye, Lock } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = (page = 1) => {
    setIsLoading(true);
    api
      .get(`/audit/logs?page=${page}&limit=20`)
      .then((res) => {
        setLogs(res.data.data);
        if (res.data.meta) {
          setMeta({ page: res.data.meta.page, totalPages: res.data.meta.totalPages });
        }
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const columns: Column<AuditLog>[] = [
    {
      header: 'Timestamp (UTC / Local)',
      render: (l) => (
        <span className="font-mono text-xs text-slate-600">
          {new Date(l.timestamp).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'action',
      className: 'font-bold text-slate-800 text-xs font-mono',
    },
    {
      header: 'Actor User',
      render: (l) => (
        <div>
          <p className="font-semibold text-slate-900 text-xs">{l.actorUserId?.email || 'System'}</p>
          <p className="text-[10px] text-slate-400 capitalize">{l.actorRole || 'Internal'}</p>
        </div>
      ),
    },
    {
      header: 'Resource Scoped',
      render: (l) => <span className="font-mono text-xs text-slate-600">{l.resourceType}</span>,
    },
    {
      header: 'Audit Outcome',
      render: (l) => (
        <Badge variant={l.outcome === 'SUCCESS' ? 'success' : 'danger'}>{l.outcome}</Badge>
      ),
    },
    {
      header: 'Inspection',
      render: (l) => (
        <button
          onClick={() => setSelectedLog(l)}
          className="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-brand-600 transition-colors"
          title="Inspect Safe Metadata"
        >
          <Eye className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-slate-900">Immutable Audit Compliance Trail</h2>
            <Badge variant="success">Read-Only Protected</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed operational audit events for regulatory verification
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        page={meta.page}
        totalPages={meta.totalPages}
        onPageChange={(p) => fetchLogs(p)}
      />

      {/* Metadata Viewer Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Payload [${selectedLog.action}]`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <p className="font-semibold text-slate-700">Timestamp: {new Date(selectedLog.timestamp).toISOString()}</p>
              <p className="text-slate-500">Resource: {selectedLog.resourceType} • Actor: {selectedLog.actorUserId?.email || 'System'}</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sanitized Execution Metadata:
              </label>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-60">
                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
