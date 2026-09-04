import * as Y from 'yjs';
import YPartyKitProvider from 'y-partykit/provider';
import { IndexeddbPersistence } from 'y-indexeddb';
import type { CanvasItem, HistoryCommit, PeerUser, ToolType } from '../types/canvas';

/**
 * PartyKit WebSocket host.
 *
 * In development:  reads from .env.development  → localhost:1999
 * In production:   reads from .env.production   → chronosync.username.partykit.dev
 */
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST as string;

const PEER_COLORS = [
  '#38bdf8', // Sky Blue
  '#a855f7', // Purple
  '#f43f5e', // Rose
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

const FUN_NAMES = [
  'Neon Nomad',
  'Quantum Fox',
  'Cyber Weaver',
  'Solar Voyager',
  'Astral Pilot',
  'Pixel Phoenix',
  'Cosmic Crafter',
  'Delta Drifter',
];

export function generateRandomPeerProfile() {
  const name = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
  const color = PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)];
  const avatar = name.substring(0, 2).toUpperCase();
  return { name, color, avatar };
}

export class ChronoSyncEngine {
  public doc: Y.Doc;
  /** WebSocket provider — connects to the PartyKit edge server */
  public wsProvider: YPartyKitProvider | null = null;
  public indexeddbProvider: IndexeddbPersistence | null = null;
  public elementsMap: Y.Map<CanvasItem>;
  public commitsArray: Y.Array<HistoryCommit>;
  public roomName: string;
  public localUser: { name: string; color: string; avatar: string };
  public isIdbSynced: boolean = false;
  private commitDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  private onElementsChangeListeners: Set<(elements: CanvasItem[]) => void> = new Set();
  private onPeersChangeListeners: Set<(peers: PeerUser[]) => void> = new Set();
  private onCommitsChangeListeners: Set<(commits: HistoryCommit[]) => void> = new Set();
  private onSyncStatusListeners: Set<(synced: boolean) => void> = new Set();

  constructor(roomName: string = 'chronosync-main') {
    this.roomName = roomName;
    this.doc = new Y.Doc();
    this.elementsMap = this.doc.getMap<CanvasItem>('canvas-elements');
    this.commitsArray = this.doc.getArray<HistoryCommit>('canvas-commits');

    // Retrieve or generate persistent user profile
    const savedUser = localStorage.getItem('chronosync-user-profile');
    if (savedUser) {
      try {
        this.localUser = JSON.parse(savedUser);
      } catch {
        this.localUser = generateRandomPeerProfile();
      }
    } else {
      this.localUser = generateRandomPeerProfile();
      localStorage.setItem('chronosync-user-profile', JSON.stringify(this.localUser));
    }

    this.initProviders();
    this.bindObservers();
  }

  private initProviders() {
    // 1. IndexedDB offline persistence — keeps all canvas data locally
    //    Works even when server is unreachable (offline-first)
    try {
      this.indexeddbProvider = new IndexeddbPersistence(this.roomName, this.doc);
      this.indexeddbProvider.on('synced', () => {
        this.isIdbSynced = true;
        this.notifySyncStatus();
        this.notifyElements();
        this.notifyCommits();
      });
    } catch (err) {
      console.warn('IndexedDB initialization failed:', err);
    }

    // 2. PartyKit WebSocket Provider — replaces y-webrtc P2P mesh
    //    - Connects to a single Cloudflare Durable Object (the room)
    //    - Each user opens 1 WebSocket, server fans out to all peers
    //    - Handles awareness (cursors, tool states, selections) natively
    //    - Falls back gracefully if server is unreachable (works offline via IDB)
    try {
      if (!PARTYKIT_HOST) {
        console.warn(
          'VITE_PARTYKIT_HOST is not set. Real-time collaboration is disabled.\n' +
          'Run `npm run dev:full` to start both the Vite frontend and the local PartyKit server.'
        );
        return;
      }

      this.wsProvider = new YPartyKitProvider(
        PARTYKIT_HOST,
        // Each URL ?room= param maps to a separate isolated Durable Object
        this.roomName,
        this.doc,
        {
          connect: true,
          // Use secure WSS in production, plain WS in local dev
          params: async () => ({
            user: JSON.stringify({
              name: this.localUser.name,
              color: this.localUser.color,
              avatar: this.localUser.avatar,
            }),
          }),
        }
      );

      // Set initial awareness state — cursors, profile, tool
      this.wsProvider.awareness.setLocalStateField('user', {
        name: this.localUser.name,
        color: this.localUser.color,
        avatar: this.localUser.avatar,
        lastActive: Date.now(),
      });

      // Notify React state whenever any peer's awareness changes
      this.wsProvider.awareness.on('change', () => {
        this.notifyPeers();
      });

      // Log connection status changes for debugging
      this.wsProvider.on('status', ({ status }: { status: string }) => {
        console.info(`[ChronoSync] WebSocket status: ${status}`);
      });

    } catch (err) {
      console.warn('PartyKit WebSocket Provider initialization failed:', err);
    }
  }

  private bindObservers() {
    // Listen to canvas elements CRDT map updates
    this.elementsMap.observeDeep(() => {
      this.notifyElements();
    });

    // Listen to commits CRDT array updates
    this.commitsArray.observeDeep(() => {
      this.notifyCommits();
    });
  }

  // --- Element CRUD Operations ---

  public getElements(): CanvasItem[] {
    const items: CanvasItem[] = [];
    this.elementsMap.forEach((item) => {
      if (item && item.id) items.push(item);
    });
    return items.sort((a, b) => a.zIndex - b.zIndex);
  }

  public setElement(element: CanvasItem, commitDescription?: string) {
    this.elementsMap.set(element.id, element);
    if (commitDescription) {
      this.scheduleCommit(commitDescription);
    }
  }

  public setElements(elements: CanvasItem[], commitDescription?: string) {
    this.doc.transact(() => {
      elements.forEach((el) => {
        this.elementsMap.set(el.id, el);
      });
    });
    if (commitDescription) {
      this.scheduleCommit(commitDescription);
    }
  }

  public deleteElement(id: string, commitDescription?: string) {
    this.elementsMap.delete(id);
    if (commitDescription) {
      this.scheduleCommit(commitDescription);
    }
  }

  public deleteElements(ids: string[], commitDescription?: string) {
    this.doc.transact(() => {
      ids.forEach((id) => this.elementsMap.delete(id));
    });
    if (commitDescription) {
      this.scheduleCommit(commitDescription);
    }
  }

  public clearAll(commitDescription: string = 'Cleared Canvas') {
    this.doc.transact(() => {
      const keys = Array.from(this.elementsMap.keys());
      keys.forEach((key) => this.elementsMap.delete(key));
    });
    this.recordCommit(commitDescription);
  }

  // --- Time Travel & Commit Logging ---

  public scheduleCommit(description: string, delayMs = 1200) {
    if (this.commitDebounceTimer) {
      clearTimeout(this.commitDebounceTimer);
    }
    this.commitDebounceTimer = setTimeout(() => {
      this.recordCommit(description);
      this.commitDebounceTimer = null;
    }, delayMs);
  }

  public recordCommit(description: string): HistoryCommit {
    const snapshot = Y.snapshot(this.doc);
    const encodedSnapshot = Array.from(Y.encodeSnapshot(snapshot));
    const currentElements = this.getElements();

    const commit: HistoryCommit = {
      id: 'commit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      author: this.localUser.name,
      authorColor: this.localUser.color,
      description,
      elementCount: currentElements.length,
      snapshotData: encodedSnapshot,
      elements: JSON.parse(JSON.stringify(currentElements)),
    };

    // Append to CRDT commits array (limit to last 150 commits to prevent unbounded growth)
    this.doc.transact(() => {
      if (this.commitsArray.length >= 150) {
        this.commitsArray.delete(0, 1);
      }
      this.commitsArray.push([commit]);
    });

    return commit;
  }

  public getCommits(): HistoryCommit[] {
    return this.commitsArray.toArray();
  }

  public restoreSnapshot(commit: HistoryCommit) {
    if (!commit.elements) return;

    this.doc.transact(() => {
      // Clear current
      const currentKeys = Array.from(this.elementsMap.keys());
      currentKeys.forEach((key) => this.elementsMap.delete(key));

      // Re-populate from snapshot elements
      commit.elements.forEach((item) => {
        this.elementsMap.set(item.id, item);
      });
    });

    this.recordCommit(`Restored checkpoint: "${commit.description}"`);
  }

  // --- Peer Awareness & Live Cursors ---

  public updateLocalCursor(cursor: { x: number; y: number } | null) {
    if (!this.wsProvider) return;
    this.wsProvider.awareness.setLocalStateField('cursor', cursor);
  }

  public updateLocalSelection(selectedIds: string[]) {
    if (!this.wsProvider) return;
    this.wsProvider.awareness.setLocalStateField('selectedIds', selectedIds);
  }

  public updateLocalTool(tool: ToolType) {
    if (!this.wsProvider) return;
    this.wsProvider.awareness.setLocalStateField('activeTool', tool);
  }

  public updateLocalProfile(name: string, color: string) {
    this.localUser.name = name;
    this.localUser.color = color;
    this.localUser.avatar = name.substring(0, 2).toUpperCase();
    localStorage.setItem('chronosync-user-profile', JSON.stringify(this.localUser));

    if (this.wsProvider) {
      this.wsProvider.awareness.setLocalStateField('user', {
        name: this.localUser.name,
        color: this.localUser.color,
        avatar: this.localUser.avatar,
        lastActive: Date.now(),
      });
    }
  }

  public getPeers(): PeerUser[] {
    if (!this.wsProvider) return [];
    const states = this.wsProvider.awareness.getStates();
    const localClientId = this.doc.clientID;
    const peers: PeerUser[] = [];

    states.forEach((state, clientId) => {
      if (clientId === localClientId) return; // exclude self
      const user = state.user;
      if (user) {
        peers.push({
          clientId,
          name: user.name || `User ${clientId}`,
          color: user.color || '#38bdf8',
          avatar: user.avatar || 'U',
          cursor: state.cursor || null,
          selectedIds: state.selectedIds || [],
          activeTool: state.activeTool,
          lastActive: user.lastActive || Date.now(),
        });
      }
    });

    return peers;
  }

  // --- Subscriptions ---

  public subscribeElements(cb: (elements: CanvasItem[]) => void): () => void {
    this.onElementsChangeListeners.add(cb);
    cb(this.getElements());
    return () => this.onElementsChangeListeners.delete(cb);
  }

  public subscribePeers(cb: (peers: PeerUser[]) => void): () => void {
    this.onPeersChangeListeners.add(cb);
    cb(this.getPeers());
    return () => this.onPeersChangeListeners.delete(cb);
  }

  public subscribeCommits(cb: (commits: HistoryCommit[]) => void): () => void {
    this.onCommitsChangeListeners.add(cb);
    cb(this.getCommits());
    return () => this.onCommitsChangeListeners.delete(cb);
  }

  public subscribeSyncStatus(cb: (synced: boolean) => void): () => void {
    this.onSyncStatusListeners.add(cb);
    cb(this.isIdbSynced);
    return () => this.onSyncStatusListeners.delete(cb);
  }

  private notifyElements() {
    const els = this.getElements();
    this.onElementsChangeListeners.forEach((cb) => cb(els));
  }

  private notifyPeers() {
    const peers = this.getPeers();
    this.onPeersChangeListeners.forEach((cb) => cb(peers));
  }

  private notifyCommits() {
    const commits = this.getCommits();
    this.onCommitsChangeListeners.forEach((cb) => cb(commits));
  }

  private notifySyncStatus() {
    this.onSyncStatusListeners.forEach((cb) => cb(this.isIdbSynced));
  }

  public destroy() {
    if (this.commitDebounceTimer) {
      clearTimeout(this.commitDebounceTimer);
    }
    try {
      if (this.wsProvider) {
        this.wsProvider.destroy();
        this.wsProvider = null;
      }
    } catch {
      // safe cleanup
    }
    try {
      if (this.indexeddbProvider) {
        this.indexeddbProvider.destroy();
        this.indexeddbProvider = null;
      }
    } catch {
      // safe cleanup
    }
    try {
      this.doc.destroy();
    } catch {
      // safe cleanup
    }
  }
}
