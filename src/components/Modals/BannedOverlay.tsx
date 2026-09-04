import React from 'react';
import { ShieldAlert, LogOut, RefreshCw } from 'lucide-react';

interface BannedOverlayProps {
  isBanned: boolean;
  isKicked: boolean;
  roomName: string;
  onSwitchRoom: (newRoom: string) => void;
  onReconnect: () => void;
}

export const BannedOverlay: React.FC<BannedOverlayProps> = ({
  isBanned,
  isKicked,
  roomName,
  onSwitchRoom,
  onReconnect,
}) => {
  if (!isBanned && !isKicked) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 5, 12, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '100%',
          backgroundColor: '#0c0a14',
          border: isBanned ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '24px',
          boxShadow: isBanned
            ? '0 25px 60px rgba(244, 63, 94, 0.2), 0 0 40px rgba(244, 63, 94, 0.15)'
            : '0 25px 60px rgba(245, 158, 11, 0.2), 0 0 40px rgba(245, 158, 11, 0.15)',
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '18px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: isBanned ? 'rgba(244, 63, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: isBanned ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldAlert size={34} color={isBanned ? '#f43f5e' : '#f59e0b'} />
        </div>

        <div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
            {isBanned ? 'Access Denied: Banned from Workspace' : 'Removed from Session'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            {isBanned
              ? `The administrator has permanently revoked your access to workspace "${roomName}" due to suspicious or unauthorized activity.`
              : `You were removed from the active session in workspace "${roomName}" by an administrator.`}
          </p>
        </div>

        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.07)',
            borderRadius: '12px',
            padding: '12px',
            fontSize: '12px',
            color: '#cbd5e1',
          }}
        >
          <span style={{ color: '#64748b' }}>Workspace ID:</span>{' '}
          <code style={{ color: '#38bdf8', fontWeight: 600 }}>{roomName}</code>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '6px' }}>
          <button
            onClick={() => onSwitchRoom('main')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} /> Switch Workspace
          </button>

          <button
            onClick={onReconnect}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '12px',
              backgroundColor: isBanned ? 'rgba(244, 63, 94, 0.15)' : '#f59e0b',
              border: isBanned ? '1px solid rgba(244, 63, 94, 0.3)' : 'none',
              borderRadius: '10px',
              color: isBanned ? '#f43f5e' : '#000000',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={15} /> Recheck Access
          </button>
        </div>
      </div>
    </div>
  );
};
