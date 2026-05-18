'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/hud/Header';
import TabBar from '@/components/hud/TabBar';
import Sidebar from '@/components/hud/Sidebar';
import MainPanel from '@/components/hud/MainPanel';
import PlaybackControls from '@/components/hud/PlaybackControls';
import ManageLibrary from '@/components/hud/ManageLibrary';
import OptionsSection from '@/components/hud/OptionsSection';
import NotificationSystem from '@/components/hud/NotificationSystem';
import ModalSystem from '@/components/hud/ModalSystem';
import '@/styles/hud.css';
import { apiClient } from '@/lib/apiClient';

type Tab = 'all' | 'seq' | 'near' | 'inv';

export default function HUD() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [currentDance, setCurrentDance] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dances, setDances] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [modals, setModals] = useState<any[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: 'folder' | 'dance' } | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);

  // Load initial data from backend
  useEffect(() => {
    loadLibraryData();
    // Listen for messages from LSL via MOAP
    window.addEventListener('message', handleLSLMessage);
    return () => {
      window.removeEventListener('message', handleLSLMessage);
    };
  }, []);

  const handleLSLMessage = (event: MessageEvent) => {
    try {
      const data = event.data;
      if (typeof data === 'string' && data.startsWith('LIBRARY_DATA|')) {
        const jsonStr = data.replace('LIBRARY_DATA|', '');
        const libraryData = JSON.parse(jsonStr);
        
        if (libraryData.empty) {
          setDances([]);
          addNotification('info', libraryData.message || 'No dances found');
        } else {
          setDances(libraryData.dances || []);
          addNotification('success', `Loaded ${libraryData.dances?.length || 0} dances from LSL`);
        }
      }
    } catch (err) {
      console.error('Failed to parse LSL message:', err);
    }
  };

  const loadLibraryData = async () => {
    setIsLoading(true);
    try {
      const danceResult = await apiClient.getDances(selectedFolderId || undefined);
      setDances(danceResult.dances || []);
    } catch (err) {
      console.error('Failed to load library:', err);
      addNotification('error', 'Failed to load library');
    } finally {
      setIsLoading(false);
    }
  };

  // Send JSON command to LSL
  const sendCommand = (action: string, data?: any) => {
    const command = {
      action,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.log('Sending LSL command:', JSON.stringify(command));

    // In a real MOAP implementation, this would be:
    // window.parent.postMessage(command, '*');

    addNotification('info', `${action} executed`);
  };

  const addNotification = (type: 'success' | 'error' | 'info' | 'warning', message: string) => {
    const notification = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, notification]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
    }, 3000);
  };

  const playDance = (danceId: string) => {
    setCurrentDance(danceId);
    setIsPlaying(true);
    sendCommand('PLAY_DANCE', { danceId });
    addNotification('success', `Playing dance`);
  };

  const stopDance = () => {
    setCurrentDance(null);
    setIsPlaying(false);
    sendCommand('STOP_DANCE', {});
    addNotification('info', `Dance stopped`);
  };

  const toggleFavorite = (danceId: string) => {
    setDances((prev) =>
      prev.map((d) => (d.id === danceId ? { ...d, favorite: !d.favorite } : d))
    );
    sendCommand('TOGGLE_FAVORITE', { danceId });
  };

  const handleFolderSelect = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedItem(null);
    loadLibraryData();
  };

  const handleSelectItem = (item: { id: string; type: 'folder' | 'dance' } | null) => {
    setSelectedItem(item);
  };

  const handleScanInventory = () => {
    setIsScanning(true);
    sendCommand('SCAN_INVENTORY', {});
    addNotification('info', 'Scanning inventory for animations...');
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="hud-container">
      <div className="hud-wrapper">
        <Header currentDance={currentDance} isPlaying={isPlaying} />

        <div className="hud-main">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="hud-content">
            <Sidebar
              selectedFolders={selectedFolders}
              setSelectedFolders={setSelectedFolders}
              onFolderSelect={handleFolderSelect}
            />

            <MainPanel
              activeTab={activeTab}
              dances={dances}
              currentDance={currentDance}
              onPlayDance={playDance}
              onToggleFavorite={toggleFavorite}
              onSelectItem={handleSelectItem}
              selectedItem={selectedItem}
              onScanInventory={handleScanInventory}
              isScanning={isScanning}
            />
          </div>

          {/* Bottom Control Area: Manage Library & Options */}
          <div className="hud-bottom">
            <ManageLibrary
              onFolderCreated={loadLibraryData}
              onLibraryUpdated={loadLibraryData}
              selectedItem={selectedItem}
              onSelectItem={handleSelectItem}
            />
            <OptionsSection onOptionsChanged={loadLibraryData} />
          </div>
        </div>

        <PlaybackControls
          isPlaying={isPlaying}
          currentDance={currentDance}
          onPlay={() => currentDance && playDance(currentDance)}
          onStop={stopDance}
          onPause={() => setIsPlaying(false)}
        />
      </div>

      <NotificationSystem notifications={notifications} />
      <ModalSystem modals={modals} />
    </div>
  );
}
