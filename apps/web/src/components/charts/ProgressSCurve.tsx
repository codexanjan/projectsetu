import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface ProgressSCurveProps {
  currentProgressPct: number;
}

export const ProgressSCurve: React.FC<ProgressSCurveProps> = ({ currentProgressPct }) => {
  // S-Curve demonstration data points across project lifecycle
  const data = [
    { period: 'M01', planned: 2, actual: 2, forecast: null },
    { period: 'M04', planned: 8, actual: 9, forecast: null },
    { period: 'M08', planned: 22, actual: 20, forecast: null },
    { period: 'M12', planned: 42, actual: 36, forecast: null },
    { period: 'M16', planned: 64, actual: 48, forecast: null },
    { period: 'M20', planned: 82, actual: currentProgressPct, forecast: currentProgressPct },
    { period: 'M24', planned: 95, actual: null, forecast: currentProgressPct + 15 },
    { period: 'M28 (End)', planned: 100, actual: null, forecast: currentProgressPct + 32 },
    { period: 'M32 (Delay)', planned: 100, actual: null, forecast: 100 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Physical Progress S-Curve & Trajectory
          </h4>
          <p className="text-[11px] text-slate-500">
            Baseline Target vs Measured Physical Progress vs ML Delay Forecast
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Planned Target
          </span>
          <span className="flex items-center gap-1.5 text-blue-700 font-bold">
            <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Actual Progress
          </span>
          <span className="flex items-center gap-1.5 text-amber-600 font-bold">
            <span className="w-3 h-0.5 border-t border-dashed border-amber-600 inline-block" /> ML Forecast
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} tickFormatter={(v) => `${v}%`} tickLine={false} />
            <Tooltip
              formatter={(value: any) => [`${value}%`, '']}
              contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC', border: 'none', fontSize: '11px' }}
            />
            <Line
              type="monotone"
              dataKey="planned"
              stroke="#94A3B8"
              strokeWidth={2}
              dot={false}
              name="Planned Target"
            />
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ r: 4, fill: '#2563EB', strokeWidth: 1, stroke: '#FFFFFF' }}
              name="Actual Progress"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#D97706"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#D97706' }}
              name="Forecast Trajectory"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
