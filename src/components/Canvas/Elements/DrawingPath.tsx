import React from 'react';
import type { DrawingElement } from '../../../types/canvas';
import { pointsToSvgPath } from '../../../utils/canvasMath';

interface DrawingPathProps {
  element: DrawingElement;
  isSelected: boolean;
  isReadOnly?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: DrawingElement) => void;
}

export const DrawingPath: React.FC<DrawingPathProps> = ({
  element,
  isSelected,
  isReadOnly = false,
  onSelect,
  onPointerDownDrag,
}) => {
  const pathD = pointsToSvgPath(element.points);
  const isHighlighter = element.isHighlighter;

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
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: element.zIndex || 1,
      }}
    >
      <svg
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        {/* Neon Glow or Underlayer if selected */}
        {isSelected && (
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={element.strokeWidth + 6}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.5}
          />
        )}

        {/* Clickable Stroke Area (hitbox) */}
        <path
          d={pathD}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(16, element.strokeWidth + 10)}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pointerEvents: isReadOnly ? 'none' : 'stroke', cursor: 'grab' }}
        />

        {/* Visible Rendered Stroke */}
        <path
          d={pathD}
          fill="none"
          stroke={element.strokeColor || '#38bdf8'}
          strokeWidth={element.strokeWidth || 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={isHighlighter ? 0.35 : 1}
          style={{
            pointerEvents: 'none',
            filter: isHighlighter ? 'none' : `drop-shadow(0 0 4px ${element.strokeColor}44)`,
          }}
        />
      </svg>
    </div>
  );
};
