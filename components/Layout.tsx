
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'roster', label: 'Duty Roster', icon: '📅' },
    { id: 'personnel', label: 'Personnel', icon: '👥' },
    { id: 'absences', label: 'Leave/Excuses', icon: '🏥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="no-print hidden md:flex w-64 bg-slate-900 text-white flex-col p-6 fixed h-full">
        <div className="text-2xl font-bold mb-8 flex items-center gap-2">
          <span className="text-emerald-400">🛡️</span> DutyGuard Pro
        </div>
        <nav className="flex-1 space-y-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                activeTab === tab.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-800 text-xs text-slate-500">
          v1.0.4 Built with ❤️
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8">
        <header className="no-print flex items-center justify-between mb-8 md:hidden">
            <div className="text-xl font-bold flex items-center gap-2">
              <span className="text-emerald-600">🛡️</span> DutyGuard
            </div>
            <div className="flex gap-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`p-2 rounded-lg text-lg ${activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'}`}
                    >
                        {tab.icon}
                    </button>
                ))}
            </div>
        </header>
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
