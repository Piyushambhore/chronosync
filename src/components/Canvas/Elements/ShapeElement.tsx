import React, { useState, useRef, useEffect } from 'react';
import type { ShapeElement as ShapeElementType } from '../../../types/canvas';

interface ShapeElementProps {
  element: ShapeElementType;
  isSelected: boolean;
  isReadOnly?: boolean;
  onUpdate: (updated: Partial<ShapeElementType>) => void;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: ShapeElementType) => void;
}

export const ShapeElement: React.FC<ShapeElementProps> = ({
  element,
  isSelected,
  isReadOnly = false,
  onUpdate,
  onSelect,
  onPointerDownDrag,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    setIsEditing(true);
  };

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
      onUpdate({
        width: Math.max(40, startW + deltaX),
        height: Math.max(40, startH + deltaY),
      });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const renderShapeSvg = () => {
    const w = element.width;
    const h = element.height;
    const stroke = element.strokeColor || '#38bdf8';
    const fill = element.fillColor || 'rgba(56, 189, 248, 0.15)';
    const strokeWidth = element.strokeWidth || 2;
    const strokeDash = element.strokeStyle === 'dashed' ? '6 4' : undefined;

    switch (element.shapeType) {
      case 'circle':
        return (
          <ellipse
            cx={w / 2}
            cy={h / 2}
            rx={(w - strokeWidth) / 2}
            ry={(h - strokeWidth) / 2}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      case 'diamond':
        return (
          <polygon
            points={`${w / 2},${strokeWidth} ${w - strokeWidth},${h / 2} ${w / 2},${h - strokeWidth} ${strokeWidth},${h / 2}`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      case 'callout':
        return (
          <path
            d={`M 10 0 L ${w - 10} 0 Q ${w} 0 ${w} 10 L ${w} ${h - 25} Q ${w} ${h - 15} ${w - 10} ${h - 15} L 45 ${h - 15} L 20 ${h} L 25 ${h - 15} L 10 ${h - 15} Q 0 ${h - 15} 0 ${h - 25} L 0 10 Q 0 0 10 0 Z`}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      case 'star': {
        const cx = w / 2;
        const cy = h / 2;
        const spikes = 5;
        const outerRadius = Math.min(w, h) / 2 - strokeWidth;
        const innerRadius = outerRadius / 2.5;
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        let pts = '';
        for (let i = 0; i < spikes; i++) {
          x = cx + Math.cos(rot) * outerRadius;
          y = cy + Math.sin(rot) * outerRadius;
          pts += `${x},${y} `;
          rot += step;
          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          pts += `${x},${y} `;
          rot += step;
        }
        return (
          <polygon
            points={pts.trim()}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      }
      case 'rounded-rect':
        return (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={w - strokeWidth}
            height={h - strokeWidth}
            rx={16}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
      case 'rectangle':
      default:
        return (
          <rect
            x={strokeWidth / 2}
            y={strokeWidth / 2}
            width={w - strokeWidth}
            height={h - strokeWidth}
            rx={6}
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDash}
          />
        );
    }
  };

  return (
    <div
      data-element-id={element.id}
      onClick={onSelect}
      onDoubleClick={handleDoubleClick}
      onPointerDown={(e) => {
        if (!isEditing && !isReadOnly) {
          onPointerDownDrag(e, element);
        }
      }}
      style={{
        position: 'absolute',
        transform: `translate3d(${element.x}px, ${element.y}px, 0px)`,
        width: `${element.width}px`,
        height: `${element.height}px`,
        zIndex: element.zIndex || 1,
        cursor: isReadOnly ? 'default' : isEditing ? 'text' : 'grab',
        boxSizing: 'border-box',
        outline: isSelected ? '2px solid #38bdf8' : 'none',
        outlineOffset: '3px',
        borderRadius: '4px',
      }}
    >
      <svg
        width={element.width}
        height={element.height}
        style={{ display: 'block', overflow: 'visible', width: '100%', height: '100%' }}
      >
        {renderShapeSvg()}
      </svg>

      {/* Centered Text Label */}
      <div
        style={{
          position: 'absolute',
          inset: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: isEditing ? 'auto' : 'none',
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={element.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setIsEditing(false);
            }}
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              color: '#f8fafc',
              textAlign: 'center',
              padding: '4px 8px',
              fontSize: '14px',
              outline: 'none',
              maxWidth: '90%',
            }}
          />
        ) : (
          <span
            style={{
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: 500,
              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              wordBreak: 'break-word',
              userSelect: 'none',
            }}
          >
            {element.label}
          </span>
        )}
      </div>

      {/* Resize Handle */}
      {isSelected && !isReadOnly && (
        <div
          onPointerDown={handleResizePointerDown}
          style={{
            position: 'absolute',
            right: '-6px',
            bottom: '-6px',
            width: '12px',
            height: '12px',
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
