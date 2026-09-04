import React, { useRef } from 'react';
import type { CanvasItem, Viewport } from '../../types/canvas';


interface MiniMapProps {
  elements: CanvasItem[];
  viewport: Viewport;
  onPanTo: (worldX: number, worldY: number) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ elements, viewport, onPanTo }) => {
  const mapWidth = 190;
  const mapHeight = 120;
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute bounding box of all elements + current viewport
  const viewLeft = -viewport.x / viewport.zoom;
  const viewTop = -viewport.y / viewport.zoom;
  const viewRight = (window.innerWidth - viewport.x) / viewport.zoom;
  const viewBottom = (window.innerHeight - viewport.y) / viewport.zoom;

  let minX = viewLeft;
  let minY = viewTop;
  let maxX = viewRight;
  let maxY = viewBottom;

  elements.forEach((el) => {
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  });

  // Add margin
  const margin = 200;
  minX -= margin;
  minY -= margin;
  maxX += margin;
  maxY += margin;

  const worldW = Math.max(800, maxX - minX);
  const worldH = Math.max(500, maxY - minY);

  const scaleX = mapWidth / worldW;
  const scaleY = mapHeight / worldH;
  const scale = Math.min(scaleX, scaleY);

  const toMapX = (wx: number) => (wx - minX) * scale;
  const toMapY = (wy: number) => (wy - minY) * scale;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickMapX = e.clientX - rect.left;
    const clickMapY = e.clientY - rect.top;

    const targetWorldX = minX + clickMapX / scale;
    const targetWorldY = minY + clickMapY / scale;

    onPanTo(targetWorldX, targetWorldY);

    const onMove = (moveEv: PointerEvent) => {
      const curMapX = moveEv.clientX - rect.left;
      const curMapY = moveEv.clientY - rect.top;
      onPanTo(minX + curMapX / scale, minY + curMapY / scale);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const camX = toMapX(viewLeft);
  const camY = toMapY(viewTop);
  const camW = (viewRight - viewLeft) * scale;
  const camH = (viewBottom - viewTop) * scale;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: `${mapWidth}px`,
        height: `${mapHeight}px`,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
        zIndex: 990,
        cursor: 'crosshair',
        userSelect: 'none',
      }}
      title="Click or drag to navigate canvas"
    >
      {/* Background Grid Accent */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />

      {/* Render Element Mini-Rectangles */}
      {elements.map((el) => {
        const mx = toMapX(el.x);
        const my = toMapY(el.y);
        const mw = Math.max(3, el.width * scale);
        const mh = Math.max(3, el.height * scale);

        let color = '#38bdf8';
        if (el.type === 'sticky') color = el.color || '#fef08a';
        else if (el.type === 'shape') color = el.strokeColor || '#a855f7';
        else if (el.type === 'drawing') color = el.strokeColor || '#10b981';

        return (
          <div
            key={el.id}
            style={{
              position: 'absolute',
              left: `${mx}px`,
              top: `${my}px`,
              width: `${mw}px`,
              height: `${mh}px`,
              backgroundColor: color,
              borderRadius: '2px',
              opacity: 0.8,
            }}
          />
        );
      })}

      {/* Camera Viewport Indicator */}
      <div
        style={{
          position: 'absolute',
          left: `${camX}px`,
          top: `${camY}px`,
          width: `${camW}px`,
          height: `${camH}px`,
          border: '1.5px solid #38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.15)',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(56, 189, 248, 0.4)',
          pointerEvents: 'none',
        }}
      />

      {/* Radar Label */}
      <div
        style={{
          position: 'absolute',
          bottom: '4px',
          left: '6px',
          fontSize: '9px',
          fontWeight: 600,
          color: '#64748b',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        Radar
      </div>
    </div>
  );
};
