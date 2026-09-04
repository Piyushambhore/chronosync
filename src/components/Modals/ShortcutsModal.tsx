import { Keyboard, X } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'V', desc: 'Select & Move Elements' },
  { key: 'H', desc: 'Hand / Pan Tool' },
  { key: 'Space + Drag', desc: 'Quick Pan Canvas' },
  { key: 'S', desc: 'Create Sticky Note' },
  { key: 'P', desc: 'Freehand Pen' },
  { key: 'Shift + P', desc: 'Neon Highlighter' },
  { key: 'R', desc: 'Geometric Shapes' },
  { key: 'A', desc: 'Arrow Connector' },
  { key: 'T', desc: 'Text Block' },
  { key: 'E', desc: 'Eraser Tool' },
  { key: 'Del / Backspace', desc: 'Delete Selected Elements' },
  { key: '[', desc: 'Step Backward in Time Travel' },
  { key: ']', desc: 'Step Forward in Time Travel' },
  { key: 'Ctrl + V', desc: 'Paste Image from Clipboard' },
  { key: '?', desc: 'Open Shortcuts Cheat Sheet' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
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
          width: '540px',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '24px',
          gap: '16px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Keyboard size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
                Keyboard Shortcuts & Controls
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                High-productivity quick keys for infinite canvas manipulation
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Shortcuts Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '4px',
          }}
        >
          {SHORTCUTS.map((sc) => (
            <div
              key={sc.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{sc.desc}</span>
              <kbd
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  color: '#38bdf8',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
