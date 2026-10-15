import React, { useState } from 'react';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Observation, croresToPaise } from '@projectsetu/contracts';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';

interface ParsedRow {
  rowNum: number;
  reportingPeriod: string;
  expenditureCr: number;
  progressPct: number;
  blockers: string;
  evidenceCount: number;
  errors: string[];
}

export const CsvImportView: React.FC = () => {
  const { user } = useAuth();
  const [projects] = useState(() => AppStorage.getProjects());
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [rawText, setRawText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isCommitted, setIsCommitted] = useState<boolean>(false);
  const [committedCount, setCommittedCount] = useState<number>(0);

  // Download sample CSV template
  const downloadTemplate = () => {
    const csvContent = 
      "reporting_period,cumulative_expenditure_crores,physical_progress_pct,blockers,evidence_count\n" +
      "2026-03,980.5,56.0,None,2\n" +
      "2026-04,1015.0,59.5,Forest clearance pending,3\n" +
      "2026-05,1060.0,63.0,None,1\n";
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'projectsetu_monthly_observations_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseCsv(text);
    };
    reader.readAsText(file);
  };

  const parseCsv = (content: string) => {
    const lines = content.trim().split('\n');
    if (lines.length <= 1) {
      alert('CSV is empty or missing data rows.');
      return;
    }

    const rows: ParsedRow[] = [];
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const reportingPeriod = cols[0] || '';
      const expenditureCr = parseFloat(cols[1]) || 0;
      const progressPct = parseFloat(cols[2]) || 0;
      const blockers = cols[3] || 'None';
      const evidenceCount = parseInt(cols[4], 10) || 0;

      const errors: string[] = [];
      // Validation rules
      if (!/^\d{4}-\d{2}$/.test(reportingPeriod)) {
        errors.push('Reporting period must follow YYYY-MM format (e.g. 2026-03)');
      }
      if (expenditureCr < 0) {
        errors.push('Expenditure cannot be negative');
      }
      if (progressPct < 0 || progressPct > 100) {
        errors.push('Physical progress must be between 0% and 100%');
      }

      rows.push({
        rowNum: i,
        reportingPeriod,
        expenditureCr,
        progressPct,
        blockers,
        evidenceCount,
        errors
      });
    }

    setParsedRows(rows);
    setIsCommitted(false);
  };

  const totalErrors = parsedRows.filter(r => r.errors.length > 0).length;
  const validRows = parsedRows.filter(r => r.errors.length === 0);

  const handleCommit = () => {
    if (!selectedProjectId) {
      alert('Please select a target project.');
      return;
    }
    if (validRows.length === 0) {
      alert('No valid rows available to commit.');
      return;
    }

    let count = 0;
    validRows.forEach(r => {
      const obs: Observation = {
        id: `obs-csv-${Date.now()}-${r.rowNum}`,
        projectId: selectedProjectId,
        reportingPeriod: r.reportingPeriod,
        cumulativeExpenditurePaise: croresToPaise(r.expenditureCr),
        physicalProgressPct: r.progressPct,
        monthlyExpenditurePaise: croresToPaise(r.expenditureCr * 0.1),
        progressIncrementPct: 3.5,
        milestoneUpdates: {},
        blockerCategories: r.blockers !== 'None' ? ['land_acquisition'] : [],
        blockerDetails: [],
        evidenceIds: r.evidenceCount > 0 ? [`ev-auto-${r.rowNum}`] : [],
        source: 'csv_import',
        submittedBy: user?.uid || 'user-unknown',
        submittedByName: user?.displayName || 'Agency User',
        submittedAt: new Date().toISOString(),
        approvalStatus: 'submitted',
        dataQualityFlags: []
      };

      AppStorage.submitObservation(selectedProjectId, obs);
      count++;
    });

    setCommittedCount(count);
    setIsCommitted(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            CSV Historical & Batch Observation Import
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Bulk ingest historical observations, validate schema constraints, preview row-level flags, and commit.
          </p>
        </div>

        <button
          onClick={downloadTemplate}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 flex items-center gap-2 shadow-2xs transition"
        >
          <Download className="w-4 h-4 text-slate-500" />
          Download Sample CSV Template
        </button>
      </div>

      {/* Target Project Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Select Destination Project:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code}) — {p.sector}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Upload Observation CSV File:
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>
        </div>

        {/* Quick Demo Pre-load Button */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => {
              const demoCsv = 
                "reporting_period,cumulative_expenditure_crores,physical_progress_pct,blockers,evidence_count\n" +
                "2026-03,980.5,56.0,None,2\n" +
                "2026-04,1015.0,59.5,Forest clearance pending,3\n" +
                "2026-05,1060.0,63.0,None,1\n" +
                "INVALID-DATE,-50.0,120.0,Sample Error Row,0\n";
              setFileName('demo_batch_records.csv');
              setRawText(demoCsv);
              parseCsv(demoCsv);
            }}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Demonstration Batch (Includes 3 valid rows + 1 deliberate error test row)
          </button>
        </div>
      </div>

      {/* Validation Summary & Preview Table */}
      {parsedRows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Pre-Validation Ingestion Preview: {fileName}
              </h3>
              <p className="text-xs text-slate-500">
                Found {parsedRows.length} rows: <strong className="text-emerald-700">{validRows.length} valid</strong>, <strong className="text-red-600">{totalErrors} errors</strong>.
              </p>
            </div>

            {!isCommitted ? (
              <button
                onClick={handleCommit}
                disabled={validRows.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                Commit {validRows.length} Accepted Rows to Project
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Successfully committed {committedCount} records!
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Row</th>
                  <th className="p-2.5">Reporting Period</th>
                  <th className="p-2.5 text-right">Cumul. Spend (₹ Cr)</th>
                  <th className="p-2.5 text-right">Physical Progress</th>
                  <th className="p-2.5">Blockers</th>
                  <th className="p-2.5 text-center">Evidence Files</th>
                  <th className="p-2.5">Validation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {parsedRows.map(r => (
                  <tr key={r.rowNum} className={r.errors.length > 0 ? 'bg-red-50/40' : 'hover:bg-slate-50/80'}>
                    <td className="p-2.5 font-mono text-slate-400">#{r.rowNum}</td>
                    <td className="p-2.5 font-semibold text-slate-800">{r.reportingPeriod}</td>
                    <td className="p-2.5 text-right font-mono text-slate-700">₹ {r.expenditureCr.toFixed(2)} Cr</td>
                    <td className="p-2.5 text-right font-bold text-slate-800">{r.progressPct.toFixed(1)}%</td>
                    <td className="p-2.5 text-slate-600">{r.blockers}</td>
                    <td className="p-2.5 text-center font-mono">{r.evidenceCount}</td>
                    <td className="p-2.5">
                      {r.errors.length === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <div className="text-[10px] text-red-600 space-y-0.5 font-medium">
                          {r.errors.map((err, ei) => (
                            <span key={ei} className="block">• {err}</span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
