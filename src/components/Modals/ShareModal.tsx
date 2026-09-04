import { useState } from 'react';
import { Share2, Copy, Check, ExternalLink, X, Users } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  roomName: string;
  onClose: () => void;
  onSwitchRoom: (newRoom: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  roomName,
  onClose,
  onSwitchRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputRoom, setInputRoom] = useState(roomName);

  if (!isOpen) return null;

  const currentUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomName)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoom.trim() && inputRoom !== roomName) {
      onSwitchRoom(inputRoom.trim());
      onClose();
    }
  };

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
          gap: '20px',
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
              <Share2 size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
                Collaborate Peer-to-Peer
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                No central database needed. Synced via WebRTC & BroadcastChannel.
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

        {/* Share Link Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
            Direct Room Link
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              padding: '4px 6px 4px 12px',
            }}
          >
            <input
              type="text"
              readOnly
              value={currentUrl}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#e2e8f0',
                fontSize: '13px',
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: copied ? '#10b981' : '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Test in 2nd Tab Helper Box */}
        <div
          style={{
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '13px' }}>
            <Users size={16} />
            <span>Instant Multi-User Test</span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
            Open this link in a <strong>second browser window</strong> or <strong>incognito tab</strong>. You will see both peer cursors glide live in real time with zero latency and full conflict-free CRDT resolution!
          </p>
          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: '4px',
            }}
          >
            <span>Open in New Tab Now</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Switch Room Form */}
        <form onSubmit={handleSwitch} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
            Change or Create Another Room
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={inputRoom}
              onChange={(e) => setInputRoom(e.target.value)}
              placeholder="e.g. project-matrix"
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '8px 12px',
                color: '#f8fafc',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Switch Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
