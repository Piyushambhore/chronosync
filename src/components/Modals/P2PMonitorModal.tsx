import { Activity, Database, Network, X, CheckCircle2 } from 'lucide-react';
import type { PeerUser } from '../../types/canvas';

interface P2PMonitorModalProps {
  isOpen: boolean;
  roomName: string;
  isIdbSynced: boolean;
  peers: PeerUser[];
  elementCount: number;
  commitCount: number;
  localUser: { name: string; color: string; avatar: string };
  onClose: () => void;
}

export const P2PMonitorModal: React.FC<P2PMonitorModalProps> = ({
  isOpen,
  roomName,
  isIdbSynced,
  peers,
  elementCount,
  commitCount,
  localUser,
  onClose,
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
          width: '580px',
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
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Activity size={20} color="#10b981" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>
                Local-First & P2P Mesh Diagnostics
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Real-time CRDT, IndexedDB, and WebRTC telemetry
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

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {/* Card 1: Local Storage */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '12px', fontWeight: 600 }}>
              <Database size={15} />
              <span>IndexedDB Persistence</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color={isIdbSynced ? '#10b981' : '#f59e0b'} />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                {isIdbSynced ? 'Persisted Offline' : 'Syncing...'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Table: <code>y-indexeddb/{roomName}</code>
            </span>
          </div>

          {/* Card 2: WebRTC P2P Mesh */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '12px', fontWeight: 600 }}>
              <Network size={15} />
              <span>WebRTC Mesh & Broadcast</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 8px #10b981',
                }}
              />
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                {peers.length} Remote Peer{peers.length === 1 ? '' : 's'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              BroadcastChannel: Active
            </span>
          </div>
        </div>

        {/* Details List */}
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>CRDT Architecture:</span>
            <strong style={{ color: '#f8fafc' }}>Yjs Conflict-Free Replicated Data Type</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>Active Room:</span>
            <strong style={{ color: '#38bdf8' }}>{roomName}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>Canvas Elements in Doc:</span>
            <strong style={{ color: '#f8fafc' }}>{elementCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>Git History Commits:</span>
            <strong style={{ color: '#a855f7' }}>{commitCount} snapshots</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
            <span>Your Profile:</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: localUser.color,
                }}
              />
              {localUser.name}
            </span>
          </div>
        </div>

        {/* Connected Peers List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#cbd5e1' }}>
            Connected Mesh Peers ({peers.length})
          </h4>
          {peers.length === 0 ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                color: '#64748b',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              No other peers in room. Open another tab or share the room link to connect!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {peers.map((peer) => (
                <div
                  key={peer.clientId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: peer.color,
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {peer.avatar}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#f8fafc' }}>
                      {peer.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Client ID #{peer.clientId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
