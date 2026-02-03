
import React, { useState, useEffect } from 'react';
import { AppState, Personnel, AbsenceRecord, Holiday, RosterDay, DayType } from './types';
import { INITIAL_PERSONNEL, STORAGE_KEY } from './constants';
import Layout from './components/Layout';
import PersonnelList from './components/PersonnelList';
import LeaveManager from './components/LeaveManager';
import RosterView from './components/RosterView';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        exemptDates: parsed.exemptDates || [] // Migration for existing data
      };
    }
    return {
      personnel: INITIAL_PERSONNEL,
      absences: [],
      holidays: [],
      exemptDates: [],
      roster: []
    };
  });

  const [activeTab, setActiveTab] = useState('roster');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const updateState = (updater: Partial<AppState> | ((prev: AppState) => AppState)) => {
    setState(prev => {
      if (typeof updater === 'function') return updater(prev);
      return { ...prev, ...updater };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'roster':
        return <RosterView state={state} updateState={updateState} />;
      case 'personnel':
        return <PersonnelList personnel={state.personnel} updatePersonnel={(p) => updateState({ personnel: p })} />;
      case 'absences':
        return <LeaveManager state={state} updateState={updateState} />;
      case 'settings':
        return <Settings state={state} updateState={updateState} />;
      default:
        return <RosterView state={state} updateState={updateState} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
