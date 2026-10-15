import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { AlertItem } from '@projectsetu/contracts';
import { formatDate } from '@/lib/formatting';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  FileWarning, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>(() => AppStorage.getAlerts());

  const loadData = () => {
    setAlerts(AppStorage.getAlerts());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  const handleMarkRead = (id: string) => {
    AppStorage.markAlertRead(id);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Alerts & Early Warning Notices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized notifications regarding cost escalation, schedule slippage, overdue interventions, and reporting freshness.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {alerts.map(a => (
          <div
            key={a.id}
            className={`bg-white rounded-xl border p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              !a.isRead ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                a.severity === 'critical' ? 'bg-red-100 text-red-700' :
                a.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">{a.title}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    a.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {a.severity}
                  </span>
                  {!a.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1">{a.message}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                  <span>Project: <strong className="text-slate-700">{a.projectName}</strong></span>
                  <span>•</span>
                  <span>{formatDate(a.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!a.isRead && (
                <button
                  onClick={() => handleMarkRead(a.id)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Mark as Read
                </button>
              )}
              <Link
                to={a.actionUrl}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                Inspect Project <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
