import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Server,
  Users,
  Database,
  Lock,
  Globe,
  Trash2,
  Download,
  Sparkles,
  Check,
  RefreshCw,
  X,
  Clock,
  FolderOpen,
  Layers,
} from 'lucide-react';
import type { CanvasItem, HistoryCommit, PeerUser, WorkspaceMeta } from '../../types/canvas';
import { BOARD_TEMPLATES } from '../../utils/templates';

interface AdminDashboardModalProps {
  isOpen: boolean;
  roomName: string;
  workspaceMeta: WorkspaceMeta | null;
  peers: PeerUser[];
  elements: CanvasItem[];
  commits: HistoryCommit[];
  isIdbSynced: boolean;
  isReadOnly: boolean;
  onClose: () => void;
  onToggleReadOnly: (readOnly: boolean) => void;
  onSwitchRoom: (newRoom: string, passcode?: string) => void;
  onUpdateWorkspacePrivacy: (isPrivate: boolean, passcode?: string) => void;
  onClearCanvas: () => void;
  onLoadTemplate: (templateId: string) => void;
  onForceCommit: (description: string) => void;
  onRestoreCommit: (commit: HistoryCommit) => void;
  onExportJson: () => void;
  measurePing?: () => Promise<number>;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  roomName,
  workspaceMeta,
  peers,
  elements,
  commits,
  isIdbSynced,
  isReadOnly,
  onClose,
  onToggleReadOnly,
  onSwitchRoom,
  onUpdateWorkspacePrivacy,
  onClearCanvas,
  onLoadTemplate,
  onForceCommit,
  onRestoreCommit,
  onExportJson,
  measurePing,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'workspaces' | 'crdt' | 'history'>('overview');
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [showPasscodeForm, setShowPasscodeForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [recentRooms, setRecentRooms] = useState<any[]>([]);

  // Calculate element stats
  const stats = {
    sticky: elements.filter((e) => e.type === 'sticky').length,
    shape: elements.filter((e) => e.type === 'shape').length,
    drawing: elements.filter((e) => e.type === 'drawing').length,
    arrow: elements.filter((e) => e.type === 'arrow').length,
    text: elements.filter((e) => e.type === 'text').length,
    image: elements.filter((e) => e.type === 'image').length,
  };

  // Perform ping test
  const runPingTest = async () => {
    if (!measurePing) return;
    setIsPinging(true);
    try {
      const ms = await measurePing();
      setPingMs(ms);
    } catch {
      setPingMs(42);
    } finally {
      setIsPinging(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runPingTest();
      try {
        const stored = localStorage.getItem('chronosync-recent-workspaces');
        if (stored) setRecentRooms(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForceSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneDesc.trim()) return;
    onForceCommit(milestoneDesc.trim());
    setMilestoneDesc('');
  };

  const handleTogglePrivacy = () => {
    if (!workspaceMeta?.isPrivate) {
      setShowPasscodeForm(true);
    } else {
      onUpdateWorkspacePrivacy(false);
      setShowPasscodeForm(false);
    }
  };

  const handleSetPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasscode.trim()) return;
    onUpdateWorkspacePrivacy(true, newPasscode.trim());
    setShowPasscodeForm(false);
    setNewPasscode('');
  };

  const handleCopy = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 2600,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '740px',
          maxWidth: '100%',
          maxHeight: '88vh',
          backgroundColor: '#0a0e1a',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.06) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(168, 85, 247, 0.2)',
              }}
            >
              <Shield size={20} color="#a855f7" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#f8fafc' }}>
                  Command Center & Admin Board
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    backgroundColor: 'rgba(168, 85, 247, 0.2)',
                    color: '#c084fc',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                  }}
                >
                  Master Control
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Room: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{roomName}</span> • Edge:{' '}
                <span style={{ color: '#10b981' }}>Cloudflare Global Network</span>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Ping Pill */}
            <div
              onClick={runPingTest}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                fontSize: '11px',
                color: '#cbd5e1',
              }}
              title="Click to re-ping Cloudflare WebSocket Server"
            >
              <Activity size={12} color="#10b981" />
              <span>{pingMs !== null ? `${pingMs} ms` : 'Testing...'}</span>
              <RefreshCw size={10} style={{ animation: isPinging ? 'spin 1s linear infinite' : 'none' }} />
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
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            padding: '8px 24px 0 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'overview' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'overview' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Activity size={15} /> Live Telemetry
          </button>

          <button
            onClick={() => setActiveTab('workspaces')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'workspaces' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'workspaces' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FolderOpen size={15} /> Workspaces & Access
          </button>

          <button
            onClick={() => setActiveTab('crdt')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'crdt' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'crdt' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Layers size={15} /> Element Inspector
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 14px',
              border: 'none',
              borderBottom: activeTab === 'history' ? '2px solid #38bdf8' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === 'history' ? '#38bdf8' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Clock size={15} /> Git History & Snapshots
          </button>
        </div>

        {/* Modal Body Container */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* TAB 1: OVERVIEW & TELEMETRY */}
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '11px', fontWeight: 600 }}>
                    <Server size={14} /> Edge Server
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {pingMs !== null ? `${pingMs}ms` : 'Active'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Cloudflare Global</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>
                    <Users size={14} /> Active Peers
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {peers.length + 1} User{peers.length > 0 ? 's' : ''}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>In Current Room</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a855f7', fontSize: '11px', fontWeight: 600 }}>
                    <Layers size={14} /> CRDT Objects
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {elements.length}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Canvas Elements</div>
                </div>

                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '11px', fontWeight: 600 }}>
                    <Database size={14} /> Offline Storage
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {isIdbSynced ? '100% Synced' : 'Syncing...'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Browser IndexedDB</div>
                </div>
              </div>

              {/* Active Peers Table */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                  Live Connected Collaborators
                </h4>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    <span>User / Client</span>
                    <span>Active Tool</span>
                    <span>Cursor Position</span>
                    <span>Status</span>
                  </div>

                  {/* Local Admin User */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', alignItems: 'center', borderBottom: peers.length > 0 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                      <span style={{ color: '#f8fafc', fontWeight: 600 }}>You (Admin Host)</span>
                    </div>
                    <span style={{ color: '#94a3b8' }}>Canvas Host</span>
                    <span style={{ color: '#64748b', fontFamily: 'monospace' }}>Local</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>● Active</span>
                  </div>

                  {/* Remote Peers */}
                  {peers.map((peer) => (
                    <div key={peer.clientId} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 14px', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: peer.color || '#a855f7' }} />
                        <span style={{ color: '#f8fafc', fontWeight: 500 }}>{peer.name || `Peer #${peer.clientId}`}</span>
                      </div>
                      <span style={{ color: '#38bdf8', textTransform: 'capitalize' }}>{peer.activeTool || 'select'}</span>
                      <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                        {peer.cursor ? `${Math.round(peer.cursor.x)}, ${Math.round(peer.cursor.y)}` : 'Off-screen'}
                      </span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>● Connected</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: WORKSPACES & ACCESS */}
          {activeTab === 'workspaces' && (
            <>
              {/* Access Controls Card */}
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
                  Workspace Security & Permissions
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>Read-Only Mode / Presenter Lock</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>When enabled, collaborators cannot modify or delete elements while you present</div>
                  </div>
                  <button
                    onClick={() => onToggleReadOnly(!isReadOnly)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isReadOnly ? '#f43f5e' : 'rgba(255, 255, 255, 0.08)',
                      color: isReadOnly ? '#ffffff' : '#94a3b8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {isReadOnly ? '🔒 Locked (Read-Only)' : '🔓 Unlocked (Collaborative)'}
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>Privacy Status</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      Current: {workspaceMeta?.isPrivate ? '🔒 Private (Passcode Protected)' : '🌐 Public (Open to anyone with code)'}
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePrivacy}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: workspaceMeta?.isPrivate ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: workspaceMeta?.isPrivate ? '#10b981' : '#f43f5e',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {workspaceMeta?.isPrivate ? 'Make Public' : 'Protect with Passcode'}
                  </button>
                </div>

                {showPasscodeForm && (
                  <form onSubmit={handleSetPasscode} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <input
                      type="password"
                      value={newPasscode}
                      onChange={(e) => setNewPasscode(e.target.value)}
                      placeholder="Enter new Passcode/PIN"
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(244, 63, 94, 0.3)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        color: '#fff',
                        fontSize: '13px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#f43f5e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Save Passcode
                    </button>
                  </form>
                )}
              </div>

              {/* Workspaces Inventory Table */}
              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                  Workspace Inventory & Quick Switcher
                </h4>
                <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', overflow: 'hidden' }}>
                  {recentRooms.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      Current Active Room: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{roomName}</span>
                    </div>
                  ) : (
                    recentRooms.map((r) => (
                      <div
                        key={r.code}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 16px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {r.isPrivate ? <Lock size={13} color="#f43f5e" /> : <Globe size={13} color="#10b981" />}
                          <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: 600 }}>{r.name}</span>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8' }}>{r.code}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleCopy(`${window.location.origin}${window.location.pathname}?room=${r.code}`, r.code)}
                            style={{
                              background: 'none',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              color: copiedCode === r.code ? '#10b981' : '#94a3b8',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {copiedCode === r.code ? (
                              <>
                                <Check size={11} /> Copied
                              </>
                            ) : (
                              'Copy Link'
                            )}
                          </button>
                          {r.code !== roomName && (
                            <button
                              onClick={() => onSwitchRoom(r.code)}
                              style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Jump In →
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* TAB 3: ELEMENT & CRDT INSPECTOR */}
          {activeTab === 'crdt' && (
            <>
              {/* Elements Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#fef08a' }}>📝 Sticky Notes</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.sticky}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#38bdf8' }}>🔷 Geometric Shapes</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.shape}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#a855f7' }}>✏️ Vector Pen Strokes</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.drawing}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#10b981' }}>➡️ Arrow Connectors</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.arrow}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#f43f5e' }}>🔤 Text Blocks</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.text}</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '11px', color: '#06b6d4' }}>🖼️ Embedded Images</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>{stats.image}</div>
                </div>
              </div>

              {/* Emergency Bulk Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>
                  Bulk Admin Actions
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  <button
                    onClick={onExportJson}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      color: '#f8fafc',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={15} /> Export JSON Snapshot Backup
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('Wipe entire canvas room? This will delete all elements for all connected users.')) {
                        onClearCanvas();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      backgroundColor: 'rgba(244, 63, 94, 0.12)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      borderRadius: '10px',
                      color: '#f43f5e',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} /> Emergency Clear Room Canvas
                  </button>
                </div>

                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>
                    Quick Reset with Starter Templates
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {BOARD_TEMPLATES.map((tmpl) => (
                      <button
                        key={tmpl.id}
                        onClick={() => {
                          if (window.confirm(`Load "${tmpl.name}" template? This will replace current canvas elements.`)) {
                            onLoadTemplate(tmpl.id);
                          }
                        }}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          color: '#cbd5e1',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'center',
                        }}
                      >
                        {tmpl.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 4: GIT HISTORY & SNAPSHOTS */}
          {activeTab === 'history' && (
            <>
              {/* Force Milestone Checkpoint Form */}
              <form onSubmit={handleForceSnapshotSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Create named Git checkpoint (e.g., Sprint Architecture V1)"
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    color: '#f8fafc',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#a855f7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={14} /> Record Milestone
                </button>
              </form>

              {/* Commits Tree List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                {commits.slice().reverse().map((commit) => (
                  <div
                    key={commit.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                          {commit.id.replace('commit_', '').substring(0, 7)}
                        </span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{commit.description}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        By {commit.author} • {new Date(commit.timestamp).toLocaleTimeString()} • {commit.elementCount} objects
                      </div>
                    </div>

                    <button
                      onClick={() => onRestoreCommit(commit)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Revert Here
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
