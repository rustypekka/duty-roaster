
import React, { useState } from 'react';
import { AppState, RosterDay, DayType, Personnel } from '../types';
import { getNextDays, formatDisplayDate, getDayName } from '../utils/dateUtils';
import { generateRoster } from '../services/rosterEngine';

interface RosterViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const RosterView: React.FC<RosterViewProps> = ({ state, updateState }) => {
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [counts, setCounts] = useState({ regular: 2, special: 2 });
  const [numDays, setNumDays] = useState(7);
  const [showConfig, setShowConfig] = useState(false);

  const handleGenerate = () => {
    const nextDates = getNextDays(numDays);
    const newRoster = generateRoster(nextDates, state.personnel, state.absences, state.holidays, state.exemptDates, counts);
    updateState(prev => ({ ...prev, roster: newRoster }));
    setShowConfig(false);
  };

  const toggleOverride = (date: string, personnelId: string) => {
    updateState(prev => ({
      ...prev,
      roster: prev.roster.map(day => {
        if (day.date === date) {
          const current = day.assignedPersonnelIds;
          const newIds = current.includes(personnelId)
            ? current.filter(id => id !== personnelId)
            : [...current, personnelId];
          return { ...day, assignedPersonnelIds: newIds, manualOverride: true, requiredPersonnel: newIds.length };
        }
        return day;
      })
    }));
  };

  const finalizeRoster = () => {
    const confirmFinalize = confirm("Finalizing will permanently increment duty counts for assigned personnel. Continue?");
    if (confirmFinalize) {
      updateState(prev => {
        const newPersonnel = [...prev.personnel];
        prev.roster.forEach(day => {
          day.assignedPersonnelIds.forEach(id => {
            const index = newPersonnel.findIndex(p => p.id === id);
            if (index !== -1) {
              newPersonnel[index] = { ...newPersonnel[index], dutyCount: newPersonnel[index].dutyCount + 1 };
            }
          });
        });
        return { ...prev, personnel: newPersonnel, roster: [] }; // Clear roster after finalizing
      });
      alert("Roster finalized and counts updated!");
    }
  };

  const printRoster = () => {
    window.print();
  };

  return (
    <div>
      <div className="no-print flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Duty Roster Management</h2>
          <p className="text-slate-500">Automated scheduling based on availability and fair rotation.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2"
          >
            🔄 {state.roster.length > 0 ? 'Regenerate' : 'Generate'} Roster
          </button>
          {state.roster.length > 0 && (
            <>
              <button
                onClick={printRoster}
                className="flex-1 md:flex-none bg-white border border-slate-300 text-slate-700 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                🖨️ Print View
              </button>
              <button
                onClick={finalizeRoster}
                className="flex-1 md:flex-none bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-black transition-all"
              >
                ✅ Finalize & Save
              </button>
            </>
          )}
        </div>
      </div>

      {showConfig && (
        <div className="no-print bg-emerald-50 border border-emerald-100 rounded-xl p-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm">
          <h3 className="text-lg font-bold text-emerald-900 mb-4 flex items-center gap-2">
            ⚙️ Roster Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-2">Number of Days</label>
              <div className="flex flex-wrap gap-2">
                {[3, 7, 14, 30].map(val => (
                  <button
                    key={val}
                    onClick={() => setNumDays(val)}
                    className={`px-4 py-2 rounded-lg font-bold border-2 transition-all flex-1 ${
                      numDays === val 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                      : 'bg-white border-emerald-200 text-emerald-600 hover:border-emerald-400'
                    }`}
                  >
                    {val}d
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-2">Regular Days (Ppl)</label>
              <div className="flex gap-2">
                {[2, 3].map(val => (
                  <button
                    key={val}
                    onClick={() => setCounts({ ...counts, regular: val })}
                    className={`flex-1 py-2 rounded-lg font-bold border-2 transition-all ${
                      counts.regular === val 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                      : 'bg-white border-emerald-200 text-emerald-600 hover:border-emerald-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-800 mb-2">Holidays/Sundays (Ppl)</label>
              <div className="flex gap-2">
                {[2, 3].map(val => (
                  <button
                    key={val}
                    onClick={() => setCounts({ ...counts, special: val })}
                    className={`flex-1 py-2 rounded-lg font-bold border-2 transition-all ${
                      counts.special === val 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                      : 'bg-white border-emerald-200 text-emerald-600 hover:border-emerald-400'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-emerald-200 pt-4">
            <button
              onClick={() => setShowConfig(false)}
              className="px-4 py-2 text-emerald-700 font-medium hover:bg-emerald-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="bg-emerald-900 text-white px-8 py-2 rounded-lg font-bold shadow-lg hover:bg-black transition-all"
            >
              Generate {numDays}-Day Roster
            </button>
          </div>
        </div>
      )}

      {state.roster.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="text-4xl mb-4 text-slate-300">📅</div>
          <h3 className="text-lg font-semibold text-slate-800">No Roster Active</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2">
            Click 'Generate Roster' to specify the duration and personnel requirements for the upcoming period.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Day / Type</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Duty Personnel</th>
                <th className="px-6 py-5 text-left text-sm font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                <th className="no-print px-6 py-5 text-right text-sm font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.roster.map((day) => (
                <tr key={day.date} className={`${
                  day.type === DayType.SUNDAY ? 'bg-amber-50/30' : 
                  day.type === DayType.HOLIDAY ? 'bg-red-50/30' : 
                  day.type === DayType.EXEMPT ? 'bg-slate-100/50' :
                  'hover:bg-slate-50'
                } transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{formatDisplayDate(day.date)}</div>
                    <div className="text-sm text-slate-500">{getDayName(day.date)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      day.type === DayType.SUNDAY ? 'bg-amber-100 text-amber-800' :
                      day.type === DayType.HOLIDAY ? 'bg-red-100 text-red-800' :
                      day.type === DayType.EXEMPT ? 'bg-slate-200 text-slate-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {day.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {day.assignedPersonnelIds.length > 0 ? (
                        day.assignedPersonnelIds.map(id => {
                          const p = state.personnel.find(person => person.id === id);
                          return (
                            <span key={id} className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-md text-sm border border-emerald-100 font-medium">
                              {p?.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className={`italic text-sm ${day.type === DayType.EXEMPT ? 'text-slate-400' : 'text-red-400'}`}>
                          {day.type === DayType.EXEMPT ? 'No Duty Required' : 'No personnel assigned'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {day.manualOverride ? (
                      <span className="text-xs font-bold text-indigo-500 flex items-center gap-1">
                        ✏️ MANUAL OVERRIDE
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-400 uppercase">Auto</span>
                    )}
                  </td>
                  <td className="no-print px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingDay(editingDay === day.date ? null : day.date)}
                      className="text-slate-400 hover:text-emerald-600 p-2"
                    >
                      Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingDay && (
        <div className="no-print fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Assign Personnel: {formatDisplayDate(editingDay)}</h3>
              <button onClick={() => setEditingDay(null)} className="text-slate-400 hover:text-slate-600 text-2xl">×</button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm text-slate-500 mb-4 font-medium">Toggle personnel to manually adjust assignments.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {state.personnel.filter(p => p.active).map(p => {
                    const isAssigned = state.roster.find(d => d.date === editingDay)?.assignedPersonnelIds.includes(p.id);
                    return (
                        <button
                            key={p.id}
                            onClick={() => toggleOverride(editingDay, p.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                                isAssigned 
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                                : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                            }`}
                        >
                            <span className="font-bold text-lg">{p.name}</span>
                            {isAssigned && <span className="text-xl">✓</span>}
                        </button>
                    );
                })}
              </div>
            </div>
            <div className="p-4 bg-slate-50 flex justify-end">
              <button onClick={() => setEditingDay(null)} className="bg-slate-900 text-white px-8 py-2 rounded-lg font-bold shadow-md hover:bg-black transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterView;
