import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SpendBreakdownChartProps {
  totalBudgetCr: number;
}

export const SpendBreakdownChart: React.FC<SpendBreakdownChartProps> = ({ totalBudgetCr }) => {
  const data = [
    { month: 'Sep 25', spend: Math.round(totalBudgetCr * 0.04) },
    { month: 'Oct 25', spend: Math.round(totalBudgetCr * 0.055) },
    { month: 'Nov 25', spend: Math.round(totalBudgetCr * 0.048) },
    { month: 'Dec 25', spend: Math.round(totalBudgetCr * 0.062) },
    { month: 'Jan 26', spend: Math.round(totalBudgetCr * 0.071) },
    { month: 'Feb 26', spend: Math.round(totalBudgetCr * 0.058) },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Monthly Capital Expenditure (CAPEX) Burn
          </h4>
          <p className="text-[11px] text-slate-500">
            Disbursement & Contractor Voucher Clearing Velocity (₹ Crores)
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v} Cr`} tickLine={false} />
            <Tooltip
              formatter={(value: any) => [`₹ ${value} Cr`, 'Disbursed']}
              contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC', border: 'none', fontSize: '11px' }}
            />
            <Bar dataKey="spend" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
