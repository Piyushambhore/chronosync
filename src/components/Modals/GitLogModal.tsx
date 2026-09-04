import { GitCommit, X, Clock, Layers, ArrowRight, RotateCcw } from 'lucide-react';
import type { HistoryCommit } from '../../types/canvas';

interface GitLogModalProps {
  isOpen: boolean;
  commits: HistoryCommit[];
  activeCommitIndex: number;
  onClose: () => void;
  onSelectCommit: (index: number) => void;
  onRestoreCommit: (commit: HistoryCommit) => void;
}

export const GitLogModal: React.FC<GitLogModalProps> = ({
  isOpen,
  commits,
  activeCommitIndex,
  onClose,
  onSelectCommit,
  onRestoreCommit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '640px',
          maxHeight: '80vh',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <GitCommit size={18} color="#a855f7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f8fafc' }}>
                Document Commit History
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                {commits.length} recorded CRDT checkpoints in current session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Commit List (Reverse Chronological) */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {[...commits].reverse().map((commit, idx) => {
            const originalIndex = commits.length - 1 - idx;
            const isSelected = originalIndex === activeCommitIndex;
            const shortHash = commit.id.replace('commit_', '').substring(0, 7);

            return (
              <div
                key={commit.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  backgroundColor: isSelected
                    ? 'rgba(56, 189, 248, 0.12)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected
                    ? '1px solid rgba(56, 189, 248, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'background 0.15s ease',
                }}
              >
                {/* Left info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#38bdf8',
                      }}
                    >
                      {shortHash}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                      {commit.description}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      fontSize: '11px',
                      color: '#64748b',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: commit.authorColor || '#38bdf8',
                        }}
                      />
                      {commit.author}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} />
                      {new Date(commit.timestamp).toLocaleTimeString()}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Layers size={11} />
                      {commit.elementCount} elements
                    </span>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onSelectCommit(originalIndex);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      backgroundColor: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#0f172a' : '#e2e8f0',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span>{isSelected ? 'Current' : 'Jump'}</span>
                    <ArrowRight size={12} />
                  </button>

                  <button
                    onClick={() => {
                      onRestoreCommit(commit);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      backgroundColor: 'rgba(244, 63, 94, 0.1)',
                      color: '#f43f5e',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                    title="Restore elements from this snapshot"
                  >
                    <RotateCcw size={12} />
                    Restore
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
