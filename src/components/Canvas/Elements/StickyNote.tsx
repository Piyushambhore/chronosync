import React, { useState, useRef, useEffect } from 'react';
import type { StickyElement } from '../../../types/canvas';

interface StickyNoteProps {
  element: StickyElement;
  isSelected: boolean;
  isReadOnly?: boolean;
  onUpdate: (updated: Partial<StickyElement>) => void;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: StickyElement) => void;
}

export const StickyNote: React.FC<StickyNoteProps> = ({
  element,
  isSelected,
  isReadOnly = false,
  onUpdate,
  onSelect,
  onPointerDownDrag,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    if (isReadOnly) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      const newWidth = Math.max(140, startWidth + deltaX);
      const newHeight = Math.max(120, startHeight + deltaY);
      onUpdate({ width: newWidth, height: newHeight });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
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
        backgroundColor: element.color || '#fef08a',
        zIndex: element.zIndex || 1,
        cursor: isReadOnly ? 'default' : isEditing ? 'text' : 'grab',
        boxShadow: isSelected
          ? '0 0 0 2px #38bdf8, 0 12px 28px rgba(0,0,0,0.35)'
          : '0 8px 20px rgba(0,0,0,0.22), 0 2px 6px rgba(0,0,0,0.12)',
        borderRadius: '12px',
        padding: '14px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        userSelect: isEditing ? 'text' : 'none',
        transition: 'box-shadow 0.15s ease',
      }}
      className="group"
    >
      {/* Top Header Tag */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          opacity: 0.75,
          fontSize: '11px',
          fontWeight: 600,
          color: '#334155',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              display: 'inline-block',
            }}
          />
          {element.authorName || 'Note'}
        </span>
        <span style={{ fontSize: '10px', opacity: 0.6 }}>
          {new Date(element.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={element.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onBlur={handleBlur}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              resize: 'none',
              fontSize: '14px',
              lineHeight: '1.4',
              color: '#0f172a',
              fontFamily: 'var(--font-sans)',
              padding: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              fontSize: '14px',
              lineHeight: '1.4',
              color: '#0f172a',
              fontFamily: 'var(--font-sans)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflowY: 'auto',
            }}
          >
            {element.text || <span style={{ opacity: 0.45, fontStyle: 'italic' }}>Double-click to type...</span>}
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {isSelected && !isReadOnly && (
        <div
          onPointerDown={handleResizePointerDown}
          style={{
            position: 'absolute',
            right: '2px',
            bottom: '2px',
            width: '14px',
            height: '14px',
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M9 1L1 9M9 5L5 9M9 8L8 9" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};
