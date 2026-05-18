export default function PlaybackControls({
  isPlaying,
  currentDance,
  onPlay,
  onStop,
  onPause,
}: {
  isPlaying: boolean;
  currentDance: string | null;
  onPlay: () => void;
  onStop: () => void;
  onPause: () => void;
}) {
  return (
    <div className="playback-controls">
      <button
        className={`playback-btn play-btn ${isPlaying ? 'active' : ''}`}
        onClick={onPlay}
        disabled={!currentDance}
        title="Play Dance"
      >
        ▶
      </button>

      <button
        className={`playback-btn pause-btn ${!isPlaying && currentDance ? 'active' : ''}`}
        onClick={onPause}
        disabled={!currentDance}
        title="Pause Dance"
      >
        ⏸
      </button>

      <button
        className="playback-btn stop-btn"
        onClick={onStop}
        disabled={!currentDance}
        title="Stop Dance"
      >
        ⏹
      </button>

      <button className="playback-btn loop-btn" title="Toggle Loop">
        ⤴
      </button>

      <div className="playback-indicator">
        {isPlaying && currentDance && (
          <>
            <span className="playing-dot"></span>
            <span className="playing-text">NOW DANCING</span>
          </>
        )}
      </div>
    </div>
  );
}
