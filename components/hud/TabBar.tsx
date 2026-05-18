'use client';

type Tab = 'all' | 'seq' | 'near' | 'inv';

const TABS = [
  { id: 'all' as Tab, label: 'ALL', icon: '♫' },
  { id: 'seq' as Tab, label: 'SEQ', icon: '▶' },
  { id: 'near' as Tab, label: 'NEAR', icon: '◉' },
  { id: 'inv' as Tab, label: 'INV', icon: '✉' },
];

export default function TabBar({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) {
  return (
    <div className="tab-bar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
          {activeTab === tab.id && <div className="tab-active-line"></div>}
        </button>
      ))}
    </div>
  );
}
