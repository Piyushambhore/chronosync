import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Clock,
  Activity,
  Download,
  Trash2,
  Database,
  ChevronDown,
  Volume2,
  VolumeX,
  LayoutTemplate,
  HelpCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from 'lucide-react';
import type { PeerUser } from '../../types/canvas';
import { BOARD_TEMPLATES } from '../../utils/templates';

interface HeaderBarProps {
  roomName: string;
  isIdbSynced: boolean;
  peers: PeerUser[];
  localUser: { name: string; color: string; avatar: string };
  isTimeTravelActive: boolean;
  elementCount: number;
  commitCount: number;
  isSoundMuted: boolean;
  isPresentationMode: boolean;
  onToggleTimeTravel: () => void;
  onOpenShareModal: () => void;
  onOpenP2PMonitor: () => void;
  onOpenShortcuts: () => void;
  onToggleSound: () => void;
  onTogglePresentationMode: () => void;
  onLoadTemplate: (templateId: string) => void;
  onUpdateUserProfile: (name: string, color: string) => void;
  onClearCanvas: () => void;
  onExportJson: () => void;
  onExportPng: () => void;
}

const COLOR_OPTIONS = [
  '#38bdf8', // Cyan
  '#a855f7', // Violet
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
];

export const HeaderBar: React.FC<HeaderBarProps> = ({
  roomName,
  isIdbSynced,
  peers,
  localUser,
  isTimeTravelActive,
  elementCount,
  commitCount,
  isSoundMuted,
  isPresentationMode,
  onToggleTimeTravel,
  onOpenShareModal,
  onOpenP2PMonitor,
  onOpenShortcuts,
  onToggleSound,
  onTogglePresentationMode,
  onLoadTemplate,
  onUpdateUserProfile,
  onClearCanvas,
  onExportJson,
  onExportPng,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState(false);
  const [editName, setEditName] = useState(localUser.name);

  if (isPresentationMode) {
    return (
      <div
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={onTogglePresentationMode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '8px 14px',
            color: '#f8fafc',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          }}
          title="Exit Presentation Mode"
        >
          <EyeOff size={14} />
          <span>Exit Zen Mode</span>
        </button>
      </div>
    );
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: '12px',
        left: '16px',
        right: '16px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        pointerEvents: 'none',
      }}
    >
      {/* Left Section: Brand & Room */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '8px 16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          pointerEvents: 'auto',
        }}
      >
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
            }}
          >
            <Sparkles size={16} color="#0f172a" />
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 700,
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-sans)',
              }}
            >
              ChronoSync
            </h1>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
              Production CRDT Canvas
            </span>
          </div>
        </div>

        {/* Vertical Separator */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Room Badge */}
        <div
          onClick={onOpenShareModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '4px 10px',
            cursor: 'pointer',
          }}
          title="Click to view room share link and change room"
        >
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Room:</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>{roomName}</span>
          <span style={{ fontSize: '10px', color: '#64748b', marginLeft: '4px' }}>
            ({elementCount} obj)
          </span>
        </div>

        {/* Offline-First Storage Status Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: isIdbSynced ? '#10b981' : '#f59e0b',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: isIdbSynced ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          }}
          title="IndexedDB local storage persists changes automatically"
        >
          <Database size={13} />
          <span>{isIdbSynced ? 'Saved Local' : 'Saving...'}</span>
        </div>

        {/* Templates Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowTemplateMenu(!showTemplateMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '4px 10px',
              color: '#e2e8f0',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Load starter architecture or brainstorming templates"
          >
            <LayoutTemplate size={13} color="#38bdf8" />
            <span>Templates</span>
            <ChevronDown size={11} />
          </button>

          {showTemplateMenu && (
            <div
              style={{
                position: 'absolute',
                top: '36px',
                left: 0,
                width: '280px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', padding: '4px 8px' }}>
                STARTER WORKBOARDS
              </div>
              {BOARD_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onLoadTemplate(tmpl.id);
                    setShowTemplateMenu(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                    transition: 'background 0.15s ease',
                  }}
                  className="hover:bg-slate-800"
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                    {tmpl.name}
                  </span>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{tmpl.description}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Peers, Time Machine & Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '16px',
          padding: '8px 14px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
          pointerEvents: 'auto',
        }}
      >
        {/* Active Peers Avatar Stack */}
        <div
          onClick={onOpenP2PMonitor}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            paddingRight: '4px',
          }}
          title="View active P2P peers & mesh stats"
        >
          {/* Local User Bubble */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: localUser.color,
              border: '2px solid #0f172a',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 8px ${localUser.color}88`,
              zIndex: 3,
            }}
            title={`You (${localUser.name})`}
          >
            {localUser.avatar}
          </div>

          {/* Remote Peers Bubbles */}
          {peers.slice(0, 3).map((peer, i) => (
            <div
              key={peer.clientId}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: peer.color,
                border: '2px solid #0f172a',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-8px',
                zIndex: 2 - i,
                boxShadow: `0 0 8px ${peer.color}88`,
              }}
              title={`Peer: ${peer.name}`}
            >
              {peer.avatar}
            </div>
          ))}

          {peers.length > 3 && (
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: '#334155',
                border: '2px solid #0f172a',
                color: '#cbd5e1',
                fontSize: '10px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '-8px',
              }}
            >
              +{peers.length - 3}
            </div>
          )}
        </div>

        {/* Mesh Status Pulse */}
        <button
          onClick={onOpenP2PMonitor}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '5px 8px',
            color: '#cbd5e1',
            fontSize: '11px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          title="P2P Mesh Diagnostics"
        >
          <Activity size={13} color="#10b981" />
          <span>{peers.length} P2P</span>
        </button>

        {/* Time Travel Button */}
        <button
          onClick={onToggleTimeTravel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: isTimeTravelActive
              ? 'rgba(56, 189, 248, 0.2)'
              : 'rgba(255, 255, 255, 0.05)',
            border: isTimeTravelActive
              ? '1px solid #38bdf8'
              : '1px solid rgba(255, 255, 255, 0.08)',
            color: isTimeTravelActive ? '#38bdf8' : '#cbd5e1',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: isTimeTravelActive ? '0 0 12px rgba(56, 189, 248, 0.35)' : 'none',
          }}
          title="Toggle Git Time Machine scrubber"
        >
          <Clock size={14} />
          <span>Time Machine</span>
          <span
            style={{
              fontSize: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            {commitCount}
          </span>
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          style={{
            background: 'none',
            border: 'none',
            color: isSoundMuted ? '#64748b' : '#38bdf8',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
          }}
          title={isSoundMuted ? 'Sound FX Muted (Click to unmute)' : 'Sound FX Active'}
        >
          {isSoundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Export PNG High-Res */}
        <button
          onClick={onExportPng}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            padding: '5px 8px',
            color: '#cbd5e1',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Export high-resolution PNG image of canvas"
        >
          <ImageIcon size={13} />
          <span>PNG</span>
        </button>

        {/* Presentation / Zen Mode */}
        <button
          onClick={onTogglePresentationMode}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Presentation Mode (Hide UI)"
        >
          <Eye size={16} />
        </button>

        {/* Shortcuts Cheat Sheet */}
        <button
          onClick={onOpenShortcuts}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle size={16} />
        </button>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 12px',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'opacity 0.15s ease',
          }}
          title="Share room link"
        >
          <Share2 size={13} />
          <span>Share</span>
        </button>

        {/* User Profile Dropdown Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Edit user profile"
          >
            <ChevronDown size={14} />
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                width: '230px',
                backgroundColor: '#0f172a',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 16px 36px rgba(0,0,0,0.6)',
                zIndex: 1200,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                Peer Profile
              </span>

              {/* Edit Name */}
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => onUpdateUserProfile(editName, localUser.color)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  color: '#f8fafc',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />

              {/* Pick Color */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onUpdateUserProfile(editName, c);
                    }}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: localUser.color === c ? '2px solid #ffffff' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>

              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* Export JSON */}
              <button
                onClick={() => {
                  onExportJson();
                  setShowProfileMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#cbd5e1',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <Download size={14} />
                <span>Export Canvas Backup (JSON)</span>
              </button>

              {/* Clear Canvas */}
              <button
                onClick={() => {
                  if (
                    window.confirm('Clear all canvas elements? (This is undoable via Time Travel)')
                  ) {
                    onClearCanvas();
                  }
                  setShowProfileMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#f43f5e',
                  fontSize: '12px',
                  cursor: 'pointer',
                  padding: '4px 0',
                }}
              >
                <Trash2 size={14} />
                <span>Clear Canvas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
