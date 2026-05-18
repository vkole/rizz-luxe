'use client';

import { useState } from 'react';

type Tab = 'all' | 'seq' | 'near' | 'inv';

interface Dance {
  id: string;
  name: string;
  favorite: boolean;
  category: string;
}

interface MainPanelProps {
  activeTab: Tab;
  dances: Dance[];
  currentDance: string | null;
  onPlayDance: (danceId: string) => void;
  onToggleFavorite: (danceId: string) => void;
}

export default function MainPanel({
  activeTab,
  dances,
  currentDance,
  onPlayDance,
  onToggleFavorite,
}: MainPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const sortedDances = [...dances].sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(sortedDances.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedDances = sortedDances.slice(startIdx, startIdx + itemsPerPage);

  const renderAllDances = () => (
    <div className="dance-list">
      {displayedDances.map((dance, idx) => (
        <div
          key={dance.id}
          className={`dance-row ${currentDance === dance.id ? 'active' : ''}`}
          onClick={() => onPlayDance(dance.id)}
        >
          <button
            className={`favorite-star ${dance.favorite ? 'favorited' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(dance.id);
            }}
          >
            {dance.favorite ? '★' : '☆'}
          </button>

          <span className="dance-number">{String(startIdx + idx + 1).padStart(2, '0')}</span>

          <span className="dance-name">{dance.name}</span>

          {currentDance === dance.id && <div className="active-pulse"></div>}
        </div>
      ))}
    </div>
  );

  const renderSequences = () => (
    <div className="sequences-panel">
      <button className="create-sequence-btn">+ Create Sequence</button>
      <div className="sequence-list">
        <div className="sequence-card">
          <h3>Club Mix</h3>
          <p>5 dances • 2:45 • Loop: ON</p>
          <div className="sequence-actions">
            <button>▶ Play</button>
            <button>✎ Edit</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNearby = () => (
    <div className="nearby-panel">
      <div className="nearby-header">
        <button className="refresh-btn">⟳ Scan</button>
        <span className="range-display">Range: 96m</span>
      </div>
      <div className="avatar-list">
        <div className="avatar-row">
          <input type="checkbox" />
          <span className="avatar-name">Dancer001</span>
          <span className="avatar-distance">12m</span>
          <button className="invite-btn">Invite</button>
        </div>
        <div className="avatar-row">
          <input type="checkbox" />
          <span className="avatar-name">Choreographer</span>
          <span className="avatar-distance">45m</span>
          <button className="invite-btn">Invite</button>
        </div>
      </div>
    </div>
  );

  const renderInvites = () => (
    <div className="invites-panel">
      <div className="invite-section">
        <h3>Active Dancers</h3>
        <div className="invite-list">
          <div className="invite-row">
            <span className="dancer-name">Dancer001</span>
            <span className="status-badge accepted">Accepted</span>
            <button className="remove-btn">✕</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'all':
        return renderAllDances();
      case 'seq':
        return renderSequences();
      case 'near':
        return renderNearby();
      case 'inv':
        return renderInvites();
    }
  };

  return (
    <main className="hud-main-panel">
      {renderContent()}

      {activeTab === 'all' && (
        <div className="pagination-bar">
          <button className="pagination-btn" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            ◀
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button className="pagination-btn" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}>
            ▶
          </button>
        </div>
      )}
    </main>
  );
}
