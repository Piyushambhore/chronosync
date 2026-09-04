import React, { useState } from 'react';
import { Lock, Key, ArrowRight, Globe, ShieldAlert } from 'lucide-react';
import type { WorkspaceMeta } from '../../types/canvas';

interface PrivateRoomLockOverlayProps {
  roomName: string;
  workspaceMeta: WorkspaceMeta | null;
  onUnlock: (passcode: string) => boolean;
  onSwitchToPublic: () => void;
}

export const PrivateRoomLockOverlay: React.FC<PrivateRoomLockOverlayProps> = ({
  roomName,
  workspaceMeta,
  onUnlock,
  onSwitchToPublic,
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter the workspace passcode.');
      return;
    }

    const success = onUnlock(passcode.trim());
    if (!success) {
      setError('Incorrect passcode. Please verify with the room host.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '460px',
          maxWidth: '100%',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(244, 63, 94, 0.15)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
          transform: isShaking ? 'translateX(-8px)' : 'none',
          transition: 'transform 0.1s ease',
        }}
      >
        {/* Glowing Lock Icon */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid rgba(244, 63, 94, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(244, 63, 94, 0.3)',
          }}
        >
          <Lock size={30} color="#f43f5e" />
        </div>

        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              color: '#f43f5e',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '6px',
              padding: '2px 8px',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Passcode Protected
          </div>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>
            {workspaceMeta?.name || 'Private Workspace'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
            Room Code:{' '}
            <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>
              {roomName}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setError('');
              }}
              placeholder="Enter workspace passcode / PIN"
              autoFocus
              style={{
                width: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: error ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '14px 16px 14px 42px',
                color: '#f8fafc',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
                textAlign: 'center',
                letterSpacing: '0.1em',
              }}
            />
            <Key
              size={18}
              color="#64748b"
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', color: '#f43f5e', fontWeight: 500 }}>
              <ShieldAlert size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#f43f5e',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 0 20px rgba(244, 63, 94, 0.3)',
            }}
          >
            <ArrowRight size={16} />
            Unlock & Enter Workspace
          </button>
        </form>

        <button
          onClick={onSwitchToPublic}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '12px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <Globe size={13} />
          Or switch to public general room
        </button>
      </div>
    </div>
  );
};
