export type ElementType = 'sticky' | 'shape' | 'drawing' | 'text' | 'arrow' | 'image';

export type ShapeType = 'rectangle' | 'rounded-rect' | 'circle' | 'diamond' | 'callout' | 'star';

export interface BaseElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex: number;
  createdBy: string;
  authorName: string;
  updatedAt: number;
}

export interface StickyElement extends BaseElement {
  type: 'sticky';
  text: string;
  color: string;
  fontSize?: number;
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  strokeStyle?: 'solid' | 'dashed';
  label?: string;
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  points: { x: number; y: number }[];
  strokeColor: string;
  strokeWidth: number;
  isHighlighter?: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  color: string;
  fontSize: number;
  fontWeight?: 'normal' | 'bold' | '600';
}

export interface ArrowElement extends BaseElement {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  strokeColor: string;
  strokeWidth: number;
  arrowEnd?: boolean;
  label?: string;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string; // Base64 data URL or external URL
  aspectRatio?: number;
}

export type CanvasItem =
  | StickyElement
  | ShapeElement
  | DrawingElement
  | TextElement
  | ArrowElement
  | ImageElement;

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type ToolType =
  | 'select'
  | 'hand'
  | 'sticky'
  | 'pen'
  | 'highlighter'
  | 'shape'
  | 'arrow'
  | 'text'
  | 'eraser';

export interface PeerUser {
  clientId: number;
  name: string;
  color: string;
  avatar: string;
  cursor?: { x: number; y: number } | null;
  selectedIds?: string[];
  activeTool?: ToolType;
  lastActive: number;
}

export interface HistoryCommit {
  id: string;
  timestamp: number;
  author: string;
  authorColor: string;
  description: string;
  elementCount: number;
  snapshotData?: number[]; // Encoded Y.snapshot
  elements: CanvasItem[]; // Fast visual snapshot projection
}

export interface RoomConnectionStatus {
  isOffline: boolean;
  indexedDbSynced: boolean;
  peerCount: number;
  peers: PeerUser[];
  roomName: string;
  iceState?: string;
}

export interface WorkspaceMeta {
  code: string;
  name: string;
  isPrivate: boolean;
  passcodeHash?: string;
  createdAt: number;
  createdBy: string;
}

export interface BannedPeer {
  id: string;
  name: string;
  bannedAt: number;
  reason?: string;
  clientId?: number;
}

export interface ModerationState {
  bannedPeers: BannedPeer[];
  kickedClientIds: number[];
}

