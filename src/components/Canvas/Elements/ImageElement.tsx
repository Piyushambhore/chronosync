import React from 'react';
import type { ImageElement as ImageElementType } from '../../../types/canvas';

interface ImageElementProps {
  element: ImageElementType;
  isSelected: boolean;
  isReadOnly?: boolean;
  onUpdate: (updated: Partial<ImageElementType>) => void;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: ImageElementType) => void;
}

export const ImageElement: React.FC<ImageElementProps> = ({
  element,
  isSelected,
  isReadOnly = false,
  onUpdate,
  onSelect,
  onPointerDownDrag,
}) => {
  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.width;
    const startH = element.height;

    const onMove = (moveEv: PointerEvent) => {
      const deltaX = moveEv.clientX - startX;
      const deltaY = moveEv.clientY - startY;
      const newW = Math.max(80, startW + deltaX);
      const newH = element.aspectRatio
        ? newW / element.aspectRatio
        : Math.max(60, startH + deltaY);

      onUpdate({ width: Math.round(newW), height: Math.round(newH) });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      data-element-id={element.id}
      onClick={onSelect}
      onPointerDown={(e) => {
        if (!isReadOnly) {
          onPointerDownDrag(e, element);
        }
      }}
      style={{
        position: 'absolute',
        transform: `translate3d(${element.x}px, ${element.y}px, 0px)`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex || 1,
        cursor: isReadOnly ? 'default' : 'grab',
        boxSizing: 'border-box',
        outline: isSelected ? '2px solid #38bdf8' : 'none',
        outlineOffset: '3px',
        borderRadius: '12px',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <img
        src={element.src}
        alt="Canvas Media"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          pointerEvents: 'none',
        }}
      />

      {/* Resize Handle */}
      {isSelected && !isReadOnly && (
        <div
          onPointerDown={handleResizePointerDown}
          style={{
            position: 'absolute',
            right: '4px',
            bottom: '4px',
            width: '14px',
            height: '14px',
            backgroundColor: '#38bdf8',
            borderRadius: '50%',
            border: '2px solid #0f172a',
            cursor: 'nwse-resize',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};
