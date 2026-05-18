'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/hud/Header';
import TabBar from '@/components/hud/TabBar';
import Sidebar from '@/components/hud/Sidebar';
import MainPanel from '@/components/hud/MainPanel';
import PlaybackControls from '@/components/hud/PlaybackControls';
import NotificationSystem from '@/components/hud/NotificationSystem';
import ModalSystem from '@/components/hud/ModalSystem';
import '@/styles/hud.css';

type Tab = 'all' | 'seq' | 'near' | 'inv';

export default function HUD() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [currentDance, setCurrentDance] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dances, setDances] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [modals, setModals] = useState<any[]>([]);
  const [selectedFolders, setSelectedFolders] = useState<string[]>(['My Library']);

  // Initialize sample data
  useEffect(() => {
    const sampleDances = [
      { id: 'dance_001', name: 'Rizz Glide', favorite: true, category: 'Club Dances' },
      { id: 'dance_002', name: 'Body Roll', favorite: false, category: 'Club Dances' },
      { id: 'dance_003', name: 'Slow Wine', favorite: false, category: 'Slow Dances' },
      { id: 'dance_004', name: 'Twerk', favorite: true, category: 'Twerk' },
      { id: 'dance_005', name: 'Couple Sway', favorite: false, category: 'Couple Dances' },
      { id: 'dance_006', name: 'Hip Shake', favorite: false, category: 'Club Dances' },
    ];
    setDances(sampleDances);
  }, []);

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

  return (
    <div className="hud-container">
      <div className="hud-wrapper">
        <Header currentDance={currentDance} isPlaying={isPlaying} />
        
        <div className="hud-main">
          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <div className="hud-content">
            <Sidebar selectedFolders={selectedFolders} setSelectedFolders={setSelectedFolders} />
            
            <MainPanel
              activeTab={activeTab}
              dances={dances}
              currentDance={currentDance}
              onPlayDance={playDance}
              onToggleFavorite={toggleFavorite}
            />
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
