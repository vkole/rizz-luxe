'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  position: number;
  children?: Folder[];
}

interface SidebarProps {
  selectedFolders: string[];
  setSelectedFolders: (folders: string[]) => void;
  onFolderSelect?: (folderId: string | null) => void;
}

export default function Sidebar({ selectedFolders, setSelectedFolders, onFolderSelect }: SidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setIsLoading(true);
    try {
      const result = await apiClient.getFolders();
      const folderList = result.folders || [];
      const folderTree = buildFolderTree(folderList);
      setFolders(folderTree);
    } catch (err) {
      console.error('Failed to load folders:', err);
      setFolders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildFolderTree = (flatFolders: Folder[]): Folder[] => {
    const folderMap = new Map<string, Folder>();
    const rootFolders: Folder[] = [];

    // First pass: create map and initialize children arrays
    flatFolders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // Second pass: build tree structure
    flatFolders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId)!.children!.push(folderWithChildren);
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  };

  const toggleFolder = (folderId: string) => {
    setExpanded((prev) =>
      prev.includes(folderId) ? prev.filter((id) => id !== folderId) : [...prev, folderId]
    );
  };

  const selectFolder = (folderId: string, folderName: string) => {
    setSelectedFolders([folderName]);
    onFolderSelect?.(folderId);
  };

  const renderFolder = (folder: Folder) => (
    <div key={folder.id} className="folder-item">
      <div className="folder-header">
        <button
          className={`folder-toggle ${expanded.includes(folder.id) ? 'expanded' : ''}`}
          onClick={() => toggleFolder(folder.id)}
        >
          {folder.children && folder.children.length > 0 ? '▼' : '○'}
        </button>
        <button
          className={`folder-label ${selectedFolders.includes(folder.name) ? 'selected' : ''}`}
          onClick={() => selectFolder(folder.id, folder.name)}
        >
          📁 {folder.name}
        </button>
      </div>

      {expanded.includes(folder.id) && folder.children && folder.children.length > 0 && (
        <div className="folder-children">
          {folder.children.map((child) => renderFolder(child))}
        </div>
      )}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-state-icon">◌</div>
      <p>No folders created. Create your first folder to organize your dances.</p>
    </div>
  );

  return (
    <aside className="hud-sidebar">
      <div className="sidebar-header">
        <h2>MY LIBRARY</h2>
        <div className="sidebar-controls">
          <button className="control-btn" title="Refresh" onClick={loadFolders}>
            ⟳
          </button>
        </div>
      </div>

      <div className="folder-tree">
        {isLoading ? (
          <div className="loading">Loading folders...</div>
        ) : folders.length === 0 ? (
          renderEmptyState()
        ) : (
          folders.map((folder) => renderFolder(folder))
        )}
      </div>
    </aside>
  );
}
