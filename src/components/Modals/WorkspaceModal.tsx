import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  X,
  Lock,
  Globe,
  PlusCircle,
  LogIn,
  Key,
  Sparkles,
  RefreshCw,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import type { WorkspaceMeta } from '../../types/canvas';

interface WorkspaceModalProps {
  isOpen: boolean;
  roomName: string;
  workspaceMeta: WorkspaceMeta | null;
  onClose: () => void;
  onSwitchRoom: (newRoom: string, passcode?: string) => void;
  onCreateWorkspace: (name: string, code: string, isPrivate: boolean, passcode?: string) => void;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SYNC-${random}`;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  roomName,
  workspaceMeta,
  onClose,
  onSwitchRoom,
  onCreateWorkspace,
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'create' | 'join'>('share');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Create Workspace Form State
  const [createName, setCreateName] = useState('My Creative Space');
  const [createCode, setCreateCode] = useState(generateRoomCode());
  const [createIsPrivate, setCreateIsPrivate] = useState(false);
  const [createPasscode, setCreatePasscode] = useState('');
  const [createError, setCreateError] = useState('');

  // Join Workspace Form State
  const [joinCode, setJoinCode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [joinError, setJoinError] = useState('');

  // Recent Workspaces from localStorage
  const [recentWorkspaces, setRecentWorkspaces] = useState<
    { code: string; name: string; isPrivate: boolean; lastVisited: number }[]
  >([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('chronosync-recent-workspaces');
      if (stored) {
        setRecentWorkspaces(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentUrl = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomName)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomName);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleRegenerateCode = () => {
    setCreateCode(generateRoomCode());
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const trimmedCode = createCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCreateError('Please enter a valid room code.');
      return;
    }

    if (createIsPrivate && !createPasscode.trim()) {
      setCreateError('Please enter a passcode for the private workspace.');
      return;
    }

    onCreateWorkspace(
      createName.trim() || 'Untitled Workspace',
      trimmedCode,
      createIsPrivate,
      createIsPrivate ? createPasscode.trim() : undefined
    );
    onClose();
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    const trimmedCode = joinCode.trim().toUpperCase();
    if (!trimmedCode) {
      setJoinError('Please enter a workspace code.');
      return;
    }

    onSwitchRoom(trimmedCode, joinPasscode.trim() || undefined);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 2500,
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
          width: '560px',
          maxWidth: '100%',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(56, 189, 248, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%)',
          }}
        >
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
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
            >
              <FolderOpen size={18} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Workspaces & Real-Time Sync
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Create, share, and protect collaborative canvas rooms
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
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '8px 24px 0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <button
            onClick={() => setActiveTab('share')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'share' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'share' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Share2 size={15} />
            Current Room & Share
          </button>

          <button
            onClick={() => setActiveTab('create')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'create' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <PlusCircle size={15} />
            Create Workspace
          </button>

          <button
            onClick={() => setActiveTab('join')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'join' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'join' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <LogIn size={15} />
            Join with Code
          </button>
        </div>

        {/* Tab 1: Current Workspace & Share */}
        {activeTab === 'share' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Big Room Code Highlight Card */}
            <div
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {workspaceMeta?.isPrivate ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(244, 63, 94, 0.15)',
                        color: '#f43f5e',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                      }}
                    >
                      <Lock size={11} /> Private Workspace
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                      }}
                    >
                      <Globe size={11} /> Public Workspace
                    </span>
                  )}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                    {workspaceMeta?.name || 'Live Collaborative Canvas'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                    Room Code:
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '22px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: '#38bdf8',
                    }}
                  >
                    {roomName}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: copiedCode ? '#10b981' : 'rgba(56, 189, 248, 0.2)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: copiedCode ? '#ffffff' : '#38bdf8',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedCode ? <Check size={15} /> : <Copy size={15} />}
                {copiedCode ? 'Copied Code!' : 'Copy Code'}
              </button>
            </div>

            {/* Direct Share Link Field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Full Invite Link
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#94a3b8',
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono, monospace)',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleCopyLink}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: copiedLink ? '#10b981' : '#38bdf8',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0 16px',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Recent Workspaces List */}
            {recentWorkspaces.length > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                  Recently Visited Workspaces
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '130px', overflowY: 'auto' }}>
                  {recentWorkspaces.slice(0, 4).map((ws) => (
                    <div
                      key={ws.code}
                      onClick={() => {
                        if (ws.code !== roomName) {
                          onSwitchRoom(ws.code);
                          onClose();
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: ws.code === roomName ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: ws.code === roomName ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '8px',
                        cursor: ws.code === roomName ? 'default' : 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {ws.isPrivate ? <Lock size={12} color="#f43f5e" /> : <Globe size={12} color="#10b981" />}
                        <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 500 }}>{ws.name}</span>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8' }}>{ws.code}</span>
                      </div>
                      {ws.code === roomName ? (
                        <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>Active</span>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Switch →</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Create Workspace */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Workspace Name */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Workspace Name
              </label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="e.g. Sprint Retrospective, System Architecture"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Room Code */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                  Workspace Code
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={12} /> Regenerate
                </button>
              </div>
              <input
                type="text"
                value={createCode}
                onChange={(e) => setCreateCode(e.target.value.toUpperCase())}
                placeholder="e.g. SYNC-9912"
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#38bdf8',
                  fontSize: '16px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Privacy Setting Toggle */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                Privacy & Access Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Public Option */}
                <div
                  onClick={() => setCreateIsPrivate(false)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: !createIsPrivate ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: !createIsPrivate ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={16} color={!createIsPrivate ? '#10b981' : '#64748b'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: !createIsPrivate ? '#10b981' : '#cbd5e1' }}>
                      Public Room
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Anyone with code can join & collaborate
                  </span>
                </div>

                {/* Private Option */}
                <div
                  onClick={() => setCreateIsPrivate(true)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: createIsPrivate ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: createIsPrivate ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={16} color={createIsPrivate ? '#f43f5e' : '#64748b'} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: createIsPrivate ? '#f43f5e' : '#cbd5e1' }}>
                      Private Room
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Requires Passcode/PIN to unlock & view
                  </span>
                </div>
              </div>
            </div>

            {/* Passcode Input (Only if Private) */}
            {createIsPrivate && (
              <div style={{ animation: 'fadeIn 0.2s ease-in' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#f43f5e', marginBottom: '6px' }}>
                  Workspace Passcode / PIN
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    value={createPasscode}
                    onChange={(e) => setCreatePasscode(e.target.value)}
                    placeholder="Enter a 4-8 character PIN or password"
                    style={{
                      width: '100%',
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: '10px',
                      padding: '10px 14px 10px 36px',
                      color: '#f8fafc',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Key
                    size={16}
                    color="#f43f5e"
                    style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Collaborators must enter this passcode before the canvas opens for them.
                </span>
              </div>
            )}

            {createError && (
              <div style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 500 }}>
                {createError}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={16} />
              Create & Enter Workspace
            </button>
          </form>
        )}

        {/* Tab 3: Join with Code */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                Enter Workspace Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. SYNC-4821 or design-sprint"
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: '#38bdf8',
                  fontSize: '18px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>
                Passcode / PIN (Only if room is Private)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={joinPasscode}
                  onChange={(e) => setJoinPasscode(e.target.value)}
                  placeholder="Leave empty if public"
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px 10px 36px',
                    color: '#f8fafc',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <Key
                  size={16}
                  color="#64748b"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
              </div>
            </div>

            {joinError && (
              <div style={{ fontSize: '12px', color: '#f43f5e', fontWeight: 500 }}>
                {joinError}
              </div>
            )}

            <button
              type="submit"
              style={{
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ArrowRight size={16} />
              Connect & Join Canvas
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
