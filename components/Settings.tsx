
import React, { useState } from 'react';
import { AppState, Holiday } from '../types';
import { formatDisplayDate } from '../utils/dateUtils';

interface SettingsProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, updateState }) => {
  const [newHoliday, setNewHoliday] = useState<Holiday>({ date: '', name: '' });
  const [newExemptDate, setNewExemptDate] = useState('');

  const addHoliday = () => {
    if (!newHoliday.date || !newHoliday.name) return;
    updateState(prev => ({ ...prev, holidays: [...prev.holidays, newHoliday] }));
    setNewHoliday({ date: '', name: '' });
  };

  const deleteHoliday = (date: string) => {
    updateState(prev => ({ ...prev, holidays: prev.holidays.filter(h => h.date !== date) }));
  };

  const addExemptDate = () => {
    if (!newExemptDate || state.exemptDates.includes(newExemptDate)) return;
    updateState(prev => ({ ...prev, exemptDates: [...prev.exemptDates, newExemptDate] }));
    setNewExemptDate('');
  };

  const deleteExemptDate = (date: string) => {
    updateState(prev => ({ ...prev, exemptDates: prev.exemptDates.filter(d => d !== date) }));
  };

  const clearAllData = () => {
    if (confirm("DANGER: This will wipe all data including personnel and history. Continue?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Holiday Management</h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <p className="text-sm text-slate-500 mb-4">Adding a holiday will trigger special roster logic for that date.</p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={newHoliday.date}
                onChange={e => setNewHoliday({ ...newHoliday, date: e.target.value })}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name</label>
              <input
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-emerald-500"
                value={newHoliday.name}
                placeholder="e.g. Independence Day"
                onChange={e => setNewHoliday({ ...newHoliday, name: e.target.value })}
              />
            </div>
            <button onClick={addHoliday} className="w-full md:w-auto bg-slate-900 text-white px-6 py-2 rounded-lg font-bold">Add Holiday</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-sm font-semibold">Name</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {state.holidays.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-slate-400 italic">No holidays configured.</td>
                </tr>
              ) : (
                state.holidays.map(h => (
                  <tr key={h.date}>
                    <td className="px-6 py-4">{formatDisplayDate(h.date)}</td>
                    <td className="px-6 py-4 font-medium">{h.name}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteHoliday(h.date)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Duty Exempt Days</h2>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
          <p className="text-sm text-slate-500 mb-4">Select dates where NO duty is required. No personnel will be assigned for these days.</p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Date</label>
              <input
                type="date"
                className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:ring-2 focus:ring-indigo-500"
                value={newExemptDate}
                onChange={e => setNewExemptDate(e.target.value)}
              />
            </div>
            <button onClick={addExemptDate} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold">Add Exempt Date</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-sm font-semibold">Notes</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {state.exemptDates.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-slate-400 italic">No exempt dates configured.</td>
                </tr>
              ) : (
                state.exemptDates.map(date => (
                  <tr key={date}>
                    <td className="px-6 py-4">{formatDisplayDate(date)}</td>
                    <td className="px-6 py-4 text-slate-500 italic">No duty personnel will be assigned</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => deleteExemptDate(date)} className="text-red-500 hover:text-red-700 font-medium">Remove</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">System Management</h2>
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm">
          <h3 className="text-red-600 font-bold mb-2">Danger Zone</h3>
          <p className="text-sm text-slate-500 mb-4">Permanently clear all data from local storage.</p>
          <button
            onClick={clearAllData}
            className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            Reset System Data
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
