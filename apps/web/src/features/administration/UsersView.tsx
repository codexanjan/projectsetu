import React, { useState, useEffect } from 'react';
import { AppStorage } from '@/lib/storage';
import { UserProfile, UserRole } from '@projectsetu/contracts';
import { Users, PlusCircle, ShieldCheck, Mail, Building2, CheckCircle2, X } from 'lucide-react';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => AppStorage.getAllUsers());
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('agency_manager');
  const [orgName, setOrgName] = useState('NHAI Regional Office');

  const loadData = () => {
    setUsers(AppStorage.getAllUsers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('projectsetu-update', loadData);
    return () => window.removeEventListener('projectsetu-update', loadData);
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const newUser: UserProfile = {
      uid: `user-inv-${Date.now()}`,
      email,
      displayName: name,
      role,
      organizationId: `org-${Date.now()}`,
      organizationName: orgName,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: 'Pending Acceptance'
    };

    AppStorage.inviteUser(newUser);
    setEmail('');
    setName('');
    setIsInviteOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            User & Organization Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage authorized MoSPI officers, implementing agency managers, field contributors, and auditors.
          </p>
        </div>

        <button
          onClick={() => setIsInviteOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          Invite User / Officer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-3">User & Email</th>
              <th className="p-3">Role & Scope</th>
              <th className="p-3">Organization</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Created Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.uid} className="hover:bg-slate-50/80">
                <td className="p-3">
                  <strong className="text-slate-900 text-xs block">{u.displayName}</strong>
                  <span className="text-slate-500 font-mono text-[11px]">{u.email}</span>
                </td>
                <td className="p-3">
                  <span className="capitalize font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-3 text-slate-700">
                  {u.organizationName}
                </td>
                <td className="p-3">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </td>
                <td className="p-3 text-right text-slate-500">
                  {u.createdAt.split('T')[0]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Invite New Authorized User</h3>
              <button onClick={() => setIsInviteOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Verma"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Official Email Address:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. anand.verma@nhai.gov.in"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Role & Permissions:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                >
                  <option value="officer">MoSPI / IPMD Officer</option>
                  <option value="agency_manager">Agency Manager</option>
                  <option value="field_contributor">Field Contributor</option>
                  <option value="auditor">Auditor (CAG)</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Organization Name:</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-3 py-2 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Send Platform Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
