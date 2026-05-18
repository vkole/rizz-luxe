'use client';

import { useState } from 'react';

const FOLDERS = [
  { id: 'lib', name: 'My Library', children: [
    { id: 'fav', name: 'Favorites', children: [] },
    { id: 'club', name: 'Club Dances', children: [] },
    { id: 'slow', name: 'Slow Dances', children: [] },
    { id: 'twerk', name: 'Twerk', children: [] },
    { id: 'couple', name: 'Couple Dances', children: [] },
    { id: 'perf', name: 'Performances', children: [] },
  ]},
];

export default function Sidebar({ selectedFolders, setSelectedFolders }: { selectedFolders: string[]; setSelectedFolders: (folders: string[]) => void }) {
  const [expanded, setExpanded] = useState<string[]>(['lib']);

  const toggleFolder = (folderId: string) => {
    setExpanded((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const selectFolder = (folderName: string) => {
    setSelectedFolders([folderName]);
  };

  const renderFolder = (folder: any) => (
    <div key={folder.id} className="folder-item">
      <div className="folder-header">
        <button
          className={`folder-toggle ${expanded.includes(folder.id) ? 'expanded' : ''}`}
          onClick={() => toggleFolder(folder.id)}
        >
          {folder.children.length > 0 ? '▼' : '○'}
        </button>
        <button
          className={`folder-label ${selectedFolders.includes(folder.name) ? 'selected' : ''}`}
          onClick={() => selectFolder(folder.name)}
        >
          📁 {folder.name}
        </button>
      </div>

      {expanded.includes(folder.id) && folder.children.length > 0 && (
        <div className="folder-children">
          {folder.children.map((child: any) => renderFolder(child))}
        </div>
      )}
    </div>
  );

  return (
    <aside className="hud-sidebar">
      <div className="sidebar-header">
        <h2>MY LIBRARY</h2>
        <div className="sidebar-controls">
          <button className="control-btn" title="New Folder">+</button>
          <button className="control-btn" title="Settings">⚙</button>
        </div>
      </div>

      <div className="folder-tree">
        {FOLDERS.map((folder) => renderFolder(folder))}
      </div>
    </aside>
  );
}
