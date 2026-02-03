
import React, { useState } from 'react';
import { AppState, AbsenceRecord } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';

interface LeaveManagerProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const LeaveManager: React.FC<LeaveManagerProps> = ({ state, updateState }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<AbsenceRecord>>({
    personnelId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'LEAVE',
    reason: ''
  });

  const saveAbsence = () => {
    if (!form.personnelId || !form.startDate || !form.endDate) return;
    const record: AbsenceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      personnelId: form.personnelId,
      startDate: form.startDate,
      endDate: form.endDate,
      type: form.type as 'LEAVE' | 'EXCUSE',
      reason: form.reason
    };
    updateState(prev => ({ ...prev, absences: [...prev.absences, record] }));
    setIsAdding(false);
  };

  const deleteAbsence = (id: string) => {
    updateState(prev => ({ ...prev, absences: prev.absences.filter(a => a.id !== id) }));
  };

  const getPersonnelName = (id: string) => {
    return state.personnel.find(p => p.id === id)?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Leave & Excuse Handling</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          + Mark Absence
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Personnel</label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.personnelId}
                onChange={e => setForm({ ...form, personnelId: e.target.value })}
              >
                <option value="">Select Personnel...</option>
                {state.personnel.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as any })}
              >
                <option value="LEAVE">Leave</option>
                <option value="EXCUSE">Excuse (Temporary)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.reason}
                placeholder="Medical, Personal, etc."
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={saveAbsence} className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">Add</button>
              <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Personnel</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Type</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Range</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Reason</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {state.absences.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">No current absence records found.</td>
              </tr>
            ) : (
              state.absences.map(a => (
                <tr key={a.id}>
                  <td className="px-6 py-4 font-medium text-slate-800">{getPersonnelName(a.personnelId)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${a.type === 'LEAVE' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {formatDisplayDate(a.startDate)} to {formatDisplayDate(a.endDate)}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{a.reason || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => deleteAbsence(a.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManager;
