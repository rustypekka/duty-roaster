
import React, { useState } from 'react';
import { Personnel } from '../types';

interface PersonnelListProps {
  personnel: Personnel[];
  updatePersonnel: (p: Personnel[]) => void;
}

const PersonnelList: React.FC<PersonnelListProps> = ({ personnel, updatePersonnel }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPerson, setNewPerson] = useState({ name: '', active: true });
  const [editForm, setEditForm] = useState<{ name: string; active: boolean }>({ name: '', active: true });

  const addPerson = () => {
    if (!newPerson.name.trim()) return;
    const p: Personnel = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPerson.name.trim().toUpperCase(),
      active: newPerson.active,
      dutyCount: 0
    };
    updatePersonnel([...personnel, p]);
    setNewPerson({ name: '', active: true });
    setIsAdding(false);
  };

  const startEditing = (p: Personnel) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, active: p.active });
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name.trim()) return;
    updatePersonnel(personnel.map(p => 
      p.id === editingId ? { ...p, name: editForm.name.trim().toUpperCase(), active: editForm.active } : p
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const toggleActive = (id: string) => {
    updatePersonnel(personnel.map(p => p.id === id ? { ...p, active: !p.active } : p));
  };

  const deletePerson = (id: string) => {
    if (confirm('Are you sure you want to remove this person?')) {
      updatePersonnel(personnel.filter(p => p.id !== id));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Nominal Roll (Alphabets)</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + Add Personnel
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-700 mb-1">Alphabet Identifier</label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="e.g. A, B, C..."
              maxLength={10}
              value={newPerson.name}
              onChange={e => setNewPerson({ ...newPerson, name: e.target.value })}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={addPerson} className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium">Save</button>
            <button onClick={() => setIsAdding(false)} className="flex-1 md:flex-none bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-medium">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[600px]">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID (Alphabet)</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Duty Count</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {personnel.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-md p-1 px-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      autoFocus
                    />
                  ) : (
                    <span className="font-bold text-lg text-emerald-700">{p.name}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 px-2 py-1 rounded text-sm font-mono">{p.dutyCount}</span>
                </td>
                <td className="px-6 py-4">
                  {editingId === p.id ? (
                    <select
                      className="border border-slate-300 rounded-md p-1 px-2 text-sm"
                      value={editForm.active ? 'true' : 'false'}
                      onChange={e => setEditForm({ ...editForm, active: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => toggleActive(p.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        p.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {p.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {editingId === p.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors text-sm font-bold"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-slate-500 hover:bg-slate-100 px-2 py-1 rounded transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEditing(p)}
                          className="text-slate-400 hover:text-emerald-600 p-2 transition-colors"
                          title="Edit Personnel"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deletePerson(p.id)}
                          className="text-slate-400 hover:text-red-600 p-2 transition-colors"
                          title="Delete Personnel"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PersonnelList;
