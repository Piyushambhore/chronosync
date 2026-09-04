import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  GitCommit,
  X,
  FastForward,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { HistoryCommit } from '../../types/canvas';

interface TimeTravelScrubberProps {
  commits: HistoryCommit[];
  isTimeTravelActive: boolean;
  activeCommitIndex: number;
  onScrubToIndex: (indexOrFn: number | ((prevIndex: number) => number)) => void;
  onRestoreCommit: (commit: HistoryCommit) => void;
  onExitTimeTravel: () => void;
  onOpenGitLog: () => void;
}

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  commits,
  isTimeTravelActive,
  activeCommitIndex,
  onScrubToIndex,
  onRestoreCommit,
  onExitTimeTravel,
  onOpenGitLog,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);
  const playbackTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalCommits = commits.length;
  const currentCommit = commits[activeCommitIndex] || commits[commits.length - 1];

  // Auto-play replay animation
  useEffect(() => {
    if (isPlaying) {
      const interval = 1000 / playbackSpeed;
      playbackTimerRef.current = setInterval(() => {
        onScrubToIndex((prevIndex: number) => {
          if (prevIndex >= totalCommits - 1) {
            setIsPlaying(false);
            return totalCommits - 1;
          }
          return prevIndex + 1;
        });
      }, interval);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    }
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, totalCommits, onScrubToIndex]);

  if (totalCommits === 0) {
    return null;
  }

  const handleStepBack = () => {
    setIsPlaying(false);
    if (activeCommitIndex > 0) {
      onScrubToIndex(activeCommitIndex - 1);
    }
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    if (activeCommitIndex < totalCommits - 1) {
      onScrubToIndex(activeCommitIndex + 1);
    }
  };

  const handleRestore = () => {
    if (currentCommit) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
      });
      onRestoreCommit(currentCommit);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        maxWidth: '92vw',
        width: '740px',
      }}
    >
      {/* Historical Status Alert Banner (when scrubbed back) */}
      {isTimeTravelActive && activeCommitIndex < totalCommits - 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.2)',
            borderRadius: '16px',
            padding: '8px 16px',
            width: '100%',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#38bdf8',
                boxShadow: '0 0 8px #38bdf8',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 500 }}>
              Viewing snapshot from{' '}
              <strong style={{ color: '#38bdf8' }}>
                {new Date(currentCommit.timestamp).toLocaleTimeString()}
              </strong>{' '}
              by {currentCommit.author} ({currentCommit.elementCount} elements)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleRestore}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="Restore this historical version into the live document"
            >
              <RotateCcw size={13} />
              Restore this Version
            </button>

            <button
              onClick={onExitTimeTravel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <X size={13} />
              Live
            </button>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Scrubber Dock */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          width: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          padding: '14px 20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Top Control Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#94a3b8',
          }}
        >
          {/* Left: Playback Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleStepBack}
              disabled={activeCommitIndex <= 0}
              style={{
                background: 'none',
                border: 'none',
                color: activeCommitIndex <= 0 ? '#475569' : '#e2e8f0',
                cursor: activeCommitIndex <= 0 ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Step back 1 commit"
            >
              <SkipBack size={16} />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? '#f43f5e' : '#38bdf8',
                border: 'none',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isPlaying
                  ? '0 0 12px rgba(244, 63, 94, 0.5)'
                  : '0 0 12px rgba(56, 189, 248, 0.5)',
                transition: 'all 0.15s ease',
              }}
              title={isPlaying ? 'Pause replay' : 'Auto replay history'}
            >
              {isPlaying ? <Pause size={15} fill="#0f172a" /> : <Play size={15} fill="#0f172a" />}
            </button>

            <button
              onClick={handleStepForward}
              disabled={activeCommitIndex >= totalCommits - 1}
              style={{
                background: 'none',
                border: 'none',
                color: activeCommitIndex >= totalCommits - 1 ? '#475569' : '#e2e8f0',
                cursor: activeCommitIndex >= totalCommits - 1 ? 'not-allowed' : 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Step forward 1 commit"
            >
              <SkipForward size={16} />
            </button>

            {/* Speed Toggle */}
            <button
              onClick={() => {
                const nextSpeed = playbackSpeed === 1 ? 2 : playbackSpeed === 2 ? 4 : 1;
                setPlaybackSpeed(nextSpeed);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                padding: '3px 6px',
                cursor: 'pointer',
                marginLeft: '4px',
              }}
              title="Change playback speed"
            >
              <FastForward size={11} />
              {playbackSpeed}x
            </button>
          </div>

          {/* Center: Current Commit Summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              maxWidth: '320px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: currentCommit.authorColor || '#38bdf8',
              }}
            />
            <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '13px' }}>
              {currentCommit.description}
            </span>
            <span style={{ color: '#64748b', fontSize: '11px' }}>
              by {currentCommit.author}
            </span>
          </div>

          {/* Right: Git Log Drawer Button & Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
              #{activeCommitIndex + 1}/{totalCommits}
            </span>

            <button
              onClick={onOpenGitLog}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                color: '#e2e8f0',
                fontSize: '11px',
                fontWeight: 500,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
              title="View full Git commit log"
            >
              <GitCommit size={13} color="#a855f7" />
              Git Log
            </button>
          </div>
        </div>

        {/* Scrub Slider with Interactive Timeline Track */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalCommits - 1)}
            value={activeCommitIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onScrubToIndex(Number(e.target.value));
            }}
            style={{
              width: '100%',
              accentColor: '#38bdf8',
              cursor: 'pointer',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #38bdf8 ${(activeCommitIndex / Math.max(1, totalCommits - 1)) * 100}%, rgba(255, 255, 255, 0.15) ${(activeCommitIndex / Math.max(1, totalCommits - 1)) * 100}%)`,
              outline: 'none',
            }}
          />
        </div>

        {/* Timeline Ticks Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 2px',
            fontSize: '10px',
            color: '#475569',
          }}
        >
          <span>Origin ({new Date(commits[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
          <span>Present (Live)</span>
        </div>
      </div>
    </div>
  );
};
