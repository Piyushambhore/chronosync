import React from 'react';
import type { ArrowElement as ArrowElementType } from '../../../types/canvas';

interface ArrowElementProps {
  element: ArrowElementType;
  isSelected: boolean;
  isReadOnly?: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: ArrowElementType) => void;
}

export const ArrowElement: React.FC<ArrowElementProps> = ({
  element,
  isSelected,
  isReadOnly = false,
  onSelect,
  onPointerDownDrag,
}) => {
  const { startX, startY, endX, endY, strokeColor, strokeWidth } = element;
  const markerId = `arrowhead-${element.id}`;

  const dx = endX - startX;
  const dy = endY - startY;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  // Calculate a slight curve control point
  const length = Math.sqrt(dx * dx + dy * dy);
  const curvature = Math.min(30, length * 0.15);
  // Perpendicular vector
  const perpX = -dy / (length || 1);
  const perpY = dx / (length || 1);
  const ctrlX = midX + perpX * curvature;
  const ctrlY = midY + perpY * curvature;

  const pathData = `M ${startX} ${startY} Q ${ctrlX} ${ctrlY} ${endX} ${endY}`;

  return (
    <div
      data-element-id={element.id}
      onClick={onSelect}
      onPointerDown={(e) => {
        if (!isReadOnly) onPointerDownDrag(e, element);
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
        <defs>
          <marker
            id={markerId}
            markerWidth="10"
            markerHeight="10"
            refX="6"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L9,3 z" fill={strokeColor || '#38bdf8'} />
          </marker>
        </defs>

        {isSelected && (
          <path
            d={pathData}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={strokeWidth + 6}
            opacity={0.4}
          />
        )}

        {/* Hitbox */}
        <path
          d={pathData}
          fill="none"
          stroke="transparent"
          strokeWidth={Math.max(20, strokeWidth + 12)}
          style={{ pointerEvents: isReadOnly ? 'none' : 'stroke', cursor: 'grab' }}
        />

        {/* Rendered Arrow Line */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor || '#38bdf8'}
          strokeWidth={strokeWidth || 2.5}
          markerEnd={`url(#${markerId})`}
          style={{ pointerEvents: 'none' }}
        />

        {element.label && (
          <text
            x={ctrlX}
            y={ctrlY - 8}
            fill="#f8fafc"
            fontSize="12"
            textAnchor="middle"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.7)',
              textShadow: '0 1px 4px rgba(0,0,0,0.9)',
              userSelect: 'none',
            }}
          >
            {element.label}
          </text>
        )}
      </svg>
    </div>
  );
};
