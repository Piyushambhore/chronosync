import React from 'react';
import type { PeerUser, Viewport } from '../../types/canvas';

interface CursorOverlayProps {
  peers: PeerUser[];
  viewport: Viewport;
}

export const CursorOverlay: React.FC<CursorOverlayProps> = ({ peers, viewport }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 999,
      }}
    >
      {peers.map((peer) => {
        if (!peer.cursor) return null;

        // Transform world coordinates to screen space
        const screenX = peer.cursor.x * viewport.zoom + viewport.x;
        const screenY = peer.cursor.y * viewport.zoom + viewport.y;

        const color = peer.color || '#38bdf8';

        return (
          <div
            key={peer.clientId}
            style={{
              position: 'absolute',
              transform: `translate3d(${screenX}px, ${screenY}px, 0px)`,
              transition: 'transform 0.08s ease-out',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                transform: 'rotate(-4deg)',
              }}
            >
              <path
                d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                fill={color}
                stroke="#ffffff"
                strokeWidth="1.2"
              />
            </svg>

            {/* Peer Name Tag */}
            <div
              style={{
                marginLeft: '14px',
                marginTop: '-6px',
                backgroundColor: color,
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                letterSpacing: '0.01em',
              }}
            >
              <span>{peer.name}</span>
              {peer.activeTool && peer.activeTool !== 'select' && (
                <span
                  style={{
                    opacity: 0.85,
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                  }}
                >
                  {peer.activeTool}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
