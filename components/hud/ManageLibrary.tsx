'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface ManageLibraryProps {
  onFolderCreated?: () => void;
  onLibraryUpdated?: () => void;
  selectedItem?: { id: string; type: 'folder' | 'dance' } | null;
  onSelectItem?: (item: { id: string; type: 'folder' | 'dance' } | null) => void;
}

export default function ManageLibrary({
  onFolderCreated,
  onLibraryUpdated,
  selectedItem,
  onSelectItem,
}: ManageLibraryProps) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [parentFolderId, setParentFolderId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [folders, setFolders] = useState<any[]>([]);

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const result = await apiClient.getFolders();
      setFolders(result.folders || []);
    } catch (err) {
      console.error('Failed to load folders:', err);
    }
  };

  const handleCreateFolder = async () => {
    setError('');

    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }

    if (folderName.length > 255) {
      setError('Folder name too long (max 255 characters)');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.createFolder(folderName, parentFolderId);
      setFolderName('');
      setParentFolderId(undefined);
      setShowCreateFolderModal(false);
      onFolderCreated?.();
      onLibraryUpdated?.();
      loadFolders();
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async () => {
    if (!selectedItem) return;

    const newName = prompt('Enter new name:');
    if (!newName || !newName.trim()) return;

    setIsLoading(true);
    try {
      await apiClient.renameItem(selectedItem.type, selectedItem.id, newName.trim());
      onLibraryUpdated?.();
      onSelectItem?.(null);
    } catch (err: any) {
      alert(err.message || 'Failed to rename item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const confirmDelete = confirm(`Are you sure you want to delete this ${selectedItem.type}?`);
    if (!confirmDelete) return;

    setIsLoading(true);
    try {
      if (selectedItem.type === 'folder') {
        await apiClient.deleteFolder(selectedItem.id);
      } else {
        await apiClient.deleteDance(selectedItem.id);
      }
      onLibraryUpdated?.();
      onSelectItem?.(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMove = async () => {
    if (!selectedItem) return;

    const targetFolderId = prompt('Enter target folder ID (leave empty for root):');
    if (targetFolderId === null) return;

    setIsLoading(true);
    try {
      await apiClient.moveItem(selectedItem.type, selectedItem.id, targetFolderId || undefined);
      onLibraryUpdated?.();
      onSelectItem?.(null);
    } catch (err: any) {
      alert(err.message || 'Failed to move item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!selectedItem || selectedItem.type !== 'dance') return;

    const targetFolderId = prompt('Enter target folder ID for copy (leave empty for root):');
    if (targetFolderId === null) return;

    setIsLoading(true);
    try {
      await apiClient.copyDance(selectedItem.id, targetFolderId || undefined);
      onLibraryUpdated?.();
    } catch (err: any) {
      alert(err.message || 'Failed to copy item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const libraryData = JSON.parse(event.target?.result as string);
          await apiClient.importLibrary(libraryData);
          onLibraryUpdated?.();
          alert('Library imported successfully');
        } catch (err: any) {
          alert(err.message || 'Failed to import library');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExport = async () => {
    try {
      const result = await apiClient.exportLibrary();
      const dataStr = JSON.stringify(result.libraryData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rizz-luxe-library-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Export failed');
    }
  };

  const handleBackup = async () => {
    const backupName = prompt('Enter backup name:', `Backup ${new Date().toLocaleString()}`);
    if (!backupName) return;

    try {
      const exportData = await apiClient.exportLibrary();
      await apiClient.createBackup(backupName, exportData.libraryData);
      onLibraryUpdated?.();
      alert('Backup created successfully');
    } catch (err: any) {
      alert(err.message || 'Backup failed');
    }
  };

  return (
    <div className="manage-library">
      <div className="manage-library-header">
        <h3>Manage Library</h3>
      </div>

      <div className="manage-library-buttons">
        <button
          className="manage-btn new-folder"
          onClick={() => setShowCreateFolderModal(true)}
          title="Create new folder"
        >
          + Folder
        </button>

        <button
          className="manage-btn rename"
          onClick={handleRename}
          disabled={!selectedItem || isLoading}
          title="Rename selected item"
        >
          ✎ Rename
        </button>

        <button
          className="manage-btn delete"
          onClick={handleDelete}
          disabled={!selectedItem || isLoading}
          title="Delete selected item"
        >
          ✕ Delete
        </button>

        <button
          className="manage-btn move"
          onClick={handleMove}
          disabled={!selectedItem || isLoading}
          title="Move to folder"
        >
          ↔ Move
        </button>

        <button
          className="manage-btn copy"
          onClick={handleCopy}
          disabled={!selectedItem || selectedItem.type !== 'dance' || isLoading}
          title="Copy item"
        >
          ⎘ Copy
        </button>

        <button
          className="manage-btn import"
          onClick={handleImport}
          title="Import library"
        >
          ⬇ Import
        </button>

        <button
          className="manage-btn export"
          onClick={handleExport}
          title="Export library"
        >
          ⬆ Export
        </button>

        <button
          className="manage-btn backup"
          onClick={handleBackup}
          title="Create backup"
        >
          ⬅ Backup
        </button>
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="create-folder-modal">
          <div className="modal-content">
            <h2>Create New Folder</h2>

            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>Folder Name *</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name..."
                maxLength={255}
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label>Parent Folder</label>
              <select
                value={parentFolderId || 'my-library'}
                onChange={(e) =>
                  setParentFolderId(e.target.value === 'my-library' ? undefined : e.target.value)
                }
                disabled={isLoading}
              >
                <option value="my-library">My Library (Root)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => {
                  setShowCreateFolderModal(false);
                  setFolderName('');
                  setError('');
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="btn-confirm"
                onClick={handleCreateFolder}
                disabled={isLoading || !folderName.trim()}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
