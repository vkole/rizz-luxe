export default function Header({ currentDance, isPlaying }: { currentDance: string | null; isPlaying: boolean }) {
  return (
    <header className="hud-header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo-area">
            <div className="logo-glow"></div>
            <h1 className="hud-title">Rizz Luxe Dancer</h1>
            <p className="hud-subtitle">Luxury Dance HUD System</p>
          </div>
        </div>

        <div className="header-right">
          <div className="status-section">
            <div className="status-indicator">
              <div className={`status-dot ${isPlaying ? 'active' : ''}`}></div>
              <span className="status-text">{isPlaying ? 'DANCING' : 'IDLE'}</span>
            </div>
            
            <div className="current-dance">
              <span className="dance-label">Now Playing:</span>
              <span className="dance-name">{currentDance || 'None'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="header-glow-line"></div>
    </header>
  );
}
