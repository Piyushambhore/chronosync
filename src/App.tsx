import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChronoSyncEngine } from './crdt/yjsProvider';
import type {
  CanvasItem,
  HistoryCommit,
  PeerUser,
  ShapeType,
  ToolType,
  Viewport,
} from './types/canvas';
import { InfiniteCanvas } from './components/Canvas/InfiniteCanvas';
import { FloatingToolbar } from './components/Toolbar/FloatingToolbar';
import { HeaderBar } from './components/Header/HeaderBar';
import { TimeTravelScrubber } from './components/TimeTravel/TimeTravelScrubber';
import { MiniMap } from './components/Canvas/MiniMap';
import { ShareModal } from './components/Modals/ShareModal';
import { P2PMonitorModal } from './components/Modals/P2PMonitorModal';
import { GitLogModal } from './components/Modals/GitLogModal';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { BOARD_TEMPLATES } from './utils/templates';
import { exportCanvasToPng } from './utils/exportCanvas';
import { soundFX } from './utils/soundEffects';
import confetti from 'canvas-confetti';

export function App() {
  // 1. Determine Room Name from URL
  const initialRoom = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || 'chronosync-canvas';
  }, []);

  const [roomName, setRoomName] = useState(initialRoom);

  // 2. CRDT Engine Instance
  const [engine, setEngine] = useState<ChronoSyncEngine | null>(null);

  // 3. Reactive State from CRDT Engine
  const [elements, setElements] = useState<CanvasItem[]>([]);
  const [peers, setPeers] = useState<PeerUser[]>([]);
  const [commits, setCommits] = useState<HistoryCommit[]>([]);
  const [isIdbSynced, setIsIdbSynced] = useState<boolean>(false);
  const [localUser, setLocalUser] = useState<{ name: string; color: string; avatar: string }>({
    name: 'Explorer',
    color: '#38bdf8',
    avatar: 'EX',
  });

  // 4. Canvas Viewport & Tool States
  const [viewport, setViewport] = useState<Viewport>({
    x: window.innerWidth / 2 - 320,
    y: window.innerHeight / 2 - 200,
    zoom: 1,
  });
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [selectedColor, setSelectedColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [selectedShapeType, setSelectedShapeType] = useState<ShapeType>('rounded-rect');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 5. Time Travel Scrubber States
  const [isTimeTravelActive, setIsTimeTravelActive] = useState(false);
  const [activeCommitIndex, setActiveCommitIndex] = useState<number>(0);

  // 6. Presentation & Audio States
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(soundFX.isMuted);

  // 7. Modals
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isP2PMonitorOpen, setIsP2PMonitorOpen] = useState(false);
  const [isGitLogOpen, setIsGitLogOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Re-initialize engine if room changes
  useEffect(() => {
    const newEngine = new ChronoSyncEngine(roomName);
    setEngine(newEngine);
    setLocalUser(newEngine.localUser);

    const unsubElements = newEngine.subscribeElements((newEls) => {
      setElements(newEls);
    });

    const unsubPeers = newEngine.subscribePeers((newPeers) => {
      setPeers(newPeers);
    });

    const unsubCommits = newEngine.subscribeCommits((newCommits) => {
      setCommits(newCommits);
      setActiveCommitIndex(Math.max(0, newCommits.length - 1));
    });

    const unsubSync = newEngine.subscribeSyncStatus((synced) => {
      setIsIdbSynced(synced);
    });

    return () => {
      unsubElements();
      unsubPeers();
      unsubCommits();
      unsubSync();
      newEngine.destroy();
    };
  }, [roomName]);

  // Provide initial starter sample elements if room is brand new
  const initializedSampleRef = useRef(false);
  useEffect(() => {
    if (isIdbSynced && !initializedSampleRef.current && engine) {
      initializedSampleRef.current = true;
      if (elements.length === 0) {
        const defaultTemplate = BOARD_TEMPLATES[0];
        engine.setElements(defaultTemplate.elements, 'Initialized Architecture Board');
      }
    }
  }, [isIdbSynced, elements.length, engine]);

  // Keep activeCommitIndex at end unless user explicitly scrubbed
  useEffect(() => {
    if (!isTimeTravelActive && commits.length > 0) {
      setActiveCommitIndex(commits.length - 1);
    }
  }, [commits.length, isTimeTravelActive]);

  // Active items: if in time travel mode and viewing earlier commit, render that snapshot's elements!
  const isViewingHistory = isTimeTravelActive && activeCommitIndex < commits.length - 1;
  const displayedElements = useMemo(() => {
    if (isViewingHistory && commits[activeCommitIndex]?.elements) {
      return commits[activeCommitIndex].elements;
    }
    return elements;
  }, [isViewingHistory, activeCommitIndex, commits, elements]);

  // Handlers for canvas element mutations
  const handleCreateElement = useCallback(
    (newEl: CanvasItem, commitDesc?: string) => {
      engine?.setElement(newEl, commitDesc);
    },
    [engine]
  );

  const handleUpdateElement = useCallback(
    (id: string, updates: Partial<CanvasItem>) => {
      const existing = elements.find((el) => el.id === id);
      if (existing && engine) {
        engine.setElement({ ...existing, ...updates, updatedAt: Date.now() } as CanvasItem);
      }
    },
    [engine, elements]
  );

  const handleDeleteElements = useCallback(
    (ids: string[]) => {
      soundFX.playSnap();
      engine?.deleteElements(ids, `Deleted ${ids.length} element${ids.length > 1 ? 's' : ''}`);
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    },
    [engine]
  );

  const handleClearCanvas = useCallback(() => {
    soundFX.playSnap();
    engine?.clearAll('Cleared entire canvas');
    setSelectedIds([]);
  }, [engine]);

  // Load Template
  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      const template = BOARD_TEMPLATES.find((t) => t.id === templateId);
      if (!template || !engine) return;

      engine.setElements(template.elements, `Loaded template: ${template.name}`);
      soundFX.playChime();
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
      });
    },
    [engine]
  );

  // Sound toggle
  const handleToggleSound = useCallback(() => {
    const muted = soundFX.toggleMute();
    setIsSoundMuted(muted);
  }, []);

  // Mini-map navigation
  const handlePanTo = useCallback((worldX: number, worldY: number) => {
    setViewport((prev) => ({
      ...prev,
      x: window.innerWidth / 2 - worldX * prev.zoom,
      y: window.innerHeight / 2 - worldY * prev.zoom,
    }));
  }, []);

  // Live cursor broadcasting
  const handleCursorMove = useCallback(
    (worldPos: { x: number; y: number } | null) => {
      engine?.updateLocalCursor(worldPos);
    },
    [engine]
  );

  // Select tool update & broadcast
  const handleSelectTool = useCallback(
    (tool: ToolType) => {
      soundFX.playClick();
      setActiveTool(tool);
      engine?.updateLocalTool(tool);
    },
    [engine]
  );

  // Time travel scrubbing
  const handleScrubToIndex = useCallback(
    (indexOrFn: number | ((prev: number) => number)) => {
      setIsTimeTravelActive(true);
      setActiveCommitIndex((prev) => {
        const next = typeof indexOrFn === 'function' ? indexOrFn(prev) : indexOrFn;
        return Math.max(0, Math.min(commits.length - 1, next));
      });
    },
    [commits.length]
  );

  const handleRestoreCommit = useCallback(
    (commit: HistoryCommit) => {
      soundFX.playChime();
      engine?.restoreSnapshot(commit);
      setIsTimeTravelActive(false);
    },
    [engine]
  );

  const handleExitTimeTravel = useCallback(() => {
    setIsTimeTravelActive(false);
    setActiveCommitIndex(Math.max(0, commits.length - 1));
  }, [commits.length]);

  // Room switching
  const handleSwitchRoom = useCallback((newRoom: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', newRoom);
    window.history.pushState({}, '', url.toString());
    setRoomName(newRoom);
    setSelectedIds([]);
  }, []);

  // Export Canvas JSON
  const handleExportJson = useCallback(() => {
    const data = {
      room: roomName,
      exportedAt: new Date().toISOString(),
      elements,
      commits: commits.map((c) => ({
        id: c.id,
        timestamp: c.timestamp,
        author: c.author,
        description: c.description,
        elementCount: c.elementCount,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${roomName}-backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [roomName, elements, commits]);

  // Export Canvas PNG
  const handleExportPng = useCallback(() => {
    soundFX.playClick();
    exportCanvasToPng(elements, roomName);
  }, [elements, roomName]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === '?') {
        setIsShortcutsOpen(true);
      } else if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) {
        setIsPresentationMode((prev) => !prev);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault();
          handleDeleteElements(selectedIds);
        }
      } else if (e.key.toLowerCase() === 'v') {
        handleSelectTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        handleSelectTool('hand');
      } else if (e.key.toLowerCase() === 's') {
        handleSelectTool('sticky');
      } else if (e.key.toLowerCase() === 'p' && !e.shiftKey) {
        handleSelectTool('pen');
      } else if (e.key.toLowerCase() === 'p' && e.shiftKey) {
        handleSelectTool('highlighter');
      } else if (e.key.toLowerCase() === 'r') {
        handleSelectTool('shape');
      } else if (e.key.toLowerCase() === 'a') {
        handleSelectTool('arrow');
      } else if (e.key.toLowerCase() === 't') {
        handleSelectTool('text');
      } else if (e.key.toLowerCase() === 'e') {
        handleSelectTool('eraser');
      } else if (e.key === '[' && commits.length > 0) {
        handleScrubToIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === ']' && commits.length > 0) {
        handleScrubToIndex((prev) => Math.min(commits.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, handleDeleteElements, handleSelectTool, handleScrubToIndex, commits.length]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Top Header Bar */}
      <HeaderBar
        roomName={roomName}
        isIdbSynced={isIdbSynced}
        peers={peers}
        localUser={localUser}
        isTimeTravelActive={isTimeTravelActive}
        elementCount={displayedElements.length}
        commitCount={commits.length}
        isSoundMuted={isSoundMuted}
        isPresentationMode={isPresentationMode}
        onToggleTimeTravel={() => setIsTimeTravelActive(!isTimeTravelActive)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenP2PMonitor={() => setIsP2PMonitorOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onToggleSound={handleToggleSound}
        onTogglePresentationMode={() => setIsPresentationMode(!isPresentationMode)}
        onLoadTemplate={handleLoadTemplate}
        onUpdateUserProfile={(name, color) => {
          engine?.updateLocalProfile(name, color);
          setLocalUser({ name, color, avatar: name.substring(0, 2).toUpperCase() });
        }}
        onClearCanvas={handleClearCanvas}
        onExportJson={handleExportJson}
        onExportPng={handleExportPng}
      />

      {/* Floating Tools Dock */}
      {!isPresentationMode && (
        <FloatingToolbar
          activeTool={activeTool}
          selectedColor={selectedColor}
          strokeWidth={strokeWidth}
          selectedShapeType={selectedShapeType}
          zoom={viewport.zoom}
          selectedCount={selectedIds.length}
          isHistoricalPreview={isViewingHistory}
          onSelectTool={handleSelectTool}
          onSelectColor={setSelectedColor}
          onSelectStrokeWidth={setStrokeWidth}
          onSelectShapeType={setSelectedShapeType}
          onZoomIn={() => setViewport((v) => ({ ...v, zoom: Math.min(3.5, v.zoom * 1.15) }))}
          onZoomOut={() => setViewport((v) => ({ ...v, zoom: Math.max(0.15, v.zoom * 0.85) }))}
          onResetZoom={() => setViewport((v) => ({ ...v, zoom: 1 }))}
          onDeleteSelected={() => handleDeleteElements(selectedIds)}
          onClearCanvas={handleClearCanvas}
        />
      )}

      {/* Master Infinite Canvas */}
      <InfiniteCanvas
        elements={displayedElements}
        selectedIds={selectedIds}
        activeTool={activeTool}
        selectedColor={selectedColor}
        strokeWidth={strokeWidth}
        selectedShapeType={selectedShapeType}
        peers={peers}
        currentUserName={localUser.name}
        viewport={viewport}
        setViewport={setViewport}
        isHistoricalPreview={isViewingHistory}
        onSelectElements={setSelectedIds}
        onUpdateElement={handleUpdateElement}
        onCreateElement={handleCreateElement}
        onDeleteElements={handleDeleteElements}
        onCursorMove={handleCursorMove}
      />

      {/* Mini-Map Radar (bottom-right) */}
      {!isPresentationMode && (
        <MiniMap elements={displayedElements} viewport={viewport} onPanTo={handlePanTo} />
      )}

      {/* Git Time Travel Scrubber */}
      {!isPresentationMode && (isTimeTravelActive || commits.length > 1) && (
        <TimeTravelScrubber
          commits={commits}
          isTimeTravelActive={isTimeTravelActive}
          activeCommitIndex={activeCommitIndex}
          onScrubToIndex={handleScrubToIndex}
          onRestoreCommit={handleRestoreCommit}
          onExitTimeTravel={handleExitTimeTravel}
          onOpenGitLog={() => setIsGitLogOpen(true)}
        />
      )}

      {/* Share & Room Switcher Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        roomName={roomName}
        onClose={() => setIsShareModalOpen(false)}
        onSwitchRoom={handleSwitchRoom}
      />

      {/* P2P Diagnostics Modal */}
      <P2PMonitorModal
        isOpen={isP2PMonitorOpen}
        roomName={roomName}
        isIdbSynced={isIdbSynced}
        peers={peers}
        elementCount={elements.length}
        commitCount={commits.length}
        localUser={localUser}
        onClose={() => setIsP2PMonitorOpen(false)}
      />

      {/* Full Git Commit Log Modal */}
      <GitLogModal
        isOpen={isGitLogOpen}
        commits={commits}
        activeCommitIndex={activeCommitIndex}
        onClose={() => setIsGitLogOpen(false)}
        onSelectCommit={(idx) => {
          handleScrubToIndex(idx);
        }}
        onRestoreCommit={handleRestoreCommit}
      />

      {/* Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />
    </div>
  );
}
export default App;
