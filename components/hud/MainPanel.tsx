'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

type Tab = 'all' | 'seq' | 'near' | 'inv';

interface Dance {
  id: string;
  name: string;
  favorite: boolean;
  category?: string;
}

interface MainPanelProps {
  activeTab: Tab;
  dances: Dance[];
  currentDance: string | null;
  onPlayDance: (danceId: string) => void;
  onToggleFavorite: (danceId: string) => void;
  onSelectItem?: (item: { id: string; type: 'folder' | 'dance' } | null) => void;
  selectedItem?: { id: string; type: 'folder' | 'dance' } | null;
}

export default function MainPanel({
  activeTab,
  dances,
  currentDance,
  onPlayDance,
  onToggleFavorite,
  onSelectItem,
  selectedItem,
}: MainPanelProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 6;

  const sortedDances = [...dances].sort((a, b) => {
    if (a.favorite !== b.favorite) return b.favorite ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(sortedDances.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const displayedDances = sortedDances.slice(startIdx, startIdx + itemsPerPage);

  const renderEmptyState = (message: string) => (
    <div className="empty-state">
      <div className="empty-state-icon">◌</div>
      <p>{message}</p>
    </div>
  );

  const renderAllDances = () => {
    if (isLoading) {
      return <div className="loading">Loading dances...</div>;
    }

    if (displayedDances.length === 0) {
      return renderEmptyState(
        'No dances found. Drop animations into the HUD inventory, then scan again.'
      );
    }

    return (
      <div className="dance-list">
        {displayedDances.map((dance, idx) => (
          <div
            key={dance.id}
            className={`dance-row ${currentDance === dance.id ? 'active' : ''} ${selectedItem?.id === dance.id && selectedItem?.type === 'dance' ? 'selected' : ''}`}
            onClick={() => onPlayDance(dance.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              onSelectItem?.({ id: dance.id, type: 'dance' });
            }}
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
  };

  const renderSequences = () => {
    return (
      <div className="sequences-panel">
        <button className="create-sequence-btn">+ Create Sequence</button>
        <div className="sequence-list">
          <div className="empty-state">
            <div className="empty-state-icon">◌</div>
            <p>No sequences created. Create your first dance sequence to get started.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderNearby = () => {
    return (
      <div className="nearby-panel">
        <div className="nearby-header">
          <button className="refresh-btn">⟳ Scan</button>
          <span className="range-display">Range: 96m</span>
        </div>
        <div className="avatar-list">
          <div className="empty-state">
            <div className="empty-state-icon">◌</div>
            <p>No nearby avatars found. Move closer to other dancers.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderInvites = () => {
    return (
      <div className="invites-panel">
        <div className="empty-state">
          <div className="empty-state-icon">◌</div>
          <p>No active invites. Send an invitation to dance with others.</p>
        </div>
      </div>
    );
  };

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

      {activeTab === 'all' && sortedDances.length > 0 && (
        <div className="pagination-bar">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ◀
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            ▶
          </button>
        </div>
      )}
    </main>
  );
}
