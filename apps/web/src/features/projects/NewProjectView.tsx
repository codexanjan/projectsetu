import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppStorage } from '@/lib/storage';
import { useAuth } from '@/features/auth/AuthContext';
import { Project, ProjectSector, croresToPaise } from '@projectsetu/contracts';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

export const NewProjectView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [code, setCode] = useState(`NHAI-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [sector, setSector] = useState<ProjectSector>('Roads & Highways');
  const [description, setDescription] = useState('');
  const [costCr, setCostCr] = useState<number>(850.0);
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2028-03-31');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [publicLocation, setPublicLocation] = useState('Pune Outer Ring Road Package 3');
  const [lat, setLat] = useState(18.5204);
  const [lng, setLng] = useState(73.8567);
  const [agencyName, setAgencyName] = useState('National Highways Authority of India (NHAI)');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a project name.');
      return;
    }
    if (costCr <= 0) {
      setError('Approved project cost must be greater than zero.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Planned completion date must be later than the project start date.');
      return;
    }

    const projectId = `proj-${Date.now()}`;
    const baselineId = `base-${projectId}-v1`;

    const newProject: Project = {
      id: projectId,
      code,
      name,
      description,
      sector,
      organizationId: 'org-nhai',
      organizationName: agencyName,
      implementingAgencyId: 'agency-piu',
      implementingAgencyName: agencyName,
      state,
      district,
      publicLocation,
      coordinates: { lat, lng },
      originalCostPaise: croresToPaise(costCr),
      currentApprovedCostPaise: croresToPaise(costCr),
      originalStartDate: startDate,
      originalEndDate: endDate,
      currentPlannedEndDate: endDate,
      currentBaselineId: baselineId,
      status: 'approved',
      visibility: 'published',
      freshnessDays: 1,
      evidenceCompletenessPct: 90,
      priorityIndex: 45,
      createdBy: user?.uid || 'user-unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    AppStorage.createProject(newProject);
    navigate(`/app/projects/${projectId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/app/projects')}
          className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Register New Infrastructure Project
          </h1>
          <p className="text-xs text-slate-500">
            Establish immutable initial baseline (Cost, Timeline, Statutory Milestones) under MoSPI IPMD Registry.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Basic Identification */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            1. Project Identification
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Official Project Title:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Pune Outer Ring Road Bypass & Elevated Viaduct"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Project Code:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Infrastructure Sector:
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value as ProjectSector)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value="Roads & Highways">Roads & Highways</option>
                <option value="Railways">Railways</option>
                <option value="Power & Renewable Energy">Power & Renewable Energy</option>
                <option value="Water & Sanitation">Water & Sanitation</option>
                <option value="Urban Infrastructure">Urban Infrastructure</option>
                <option value="Health & Education">Health & Education</option>
                <option value="Ports & Shipping">Ports & Shipping</option>
                <option value="Telecom">Telecom</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Implementing Agency:
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Scope Description:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of works, packages, key technical specifications..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Baseline Financials & Timeline */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            2. Approved Baseline Budget & Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Original Approved Cost (₹ Crores):
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={costCr}
                  onChange={(e) => setCostCr(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 pl-8 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold"
                  required
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">₹</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Planned Start Date:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Planned Completion Date:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>
          </div>
        </div>

        {/* Geography & Geospatial */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
            3. Geographic & Geospatial Coordinates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">State / UT:</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">District:</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Latitude:</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Longitude:</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                required
              />
            </div>
            <div className="sm:col-span-4">
              <label className="text-xs font-bold text-slate-700 block mb-1">Public Location Name:</label>
              <input
                type="text"
                value={publicLocation}
                onChange={(e) => setPublicLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/app/projects')}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Establish Baseline & Register Project
          </button>
        </div>
      </form>
    </div>
  );
};
