import React, { useState, useRef, useEffect } from 'react';
import type { TextElement as TextElementType } from '../../../types/canvas';

interface TextElementProps {
  element: TextElementType;
  isSelected: boolean;
  isReadOnly?: boolean;
  onUpdate: (updated: Partial<TextElementType>) => void;
  onSelect: (e: React.MouseEvent) => void;
  onPointerDownDrag: (e: React.PointerEvent, element: TextElementType) => void;
}

export const TextElement: React.FC<TextElementProps> = ({
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
        minWidth: '60px',
        minHeight: '30px',
        maxWidth: '500px',
        zIndex: element.zIndex || 1,
        cursor: isReadOnly ? 'default' : isEditing ? 'text' : 'grab',
        outline: isSelected ? '2px solid #38bdf8' : 'none',
        outlineOffset: '4px',
        borderRadius: '4px',
        padding: '2px 4px',
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={element.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          style={{
            background: 'rgba(15, 23, 42, 0.9)',
            color: element.color || '#f8fafc',
            border: '1px solid #38bdf8',
            borderRadius: '4px',
            outline: 'none',
            fontSize: `${element.fontSize || 18}px`,
            fontWeight: element.fontWeight || 'normal',
            fontFamily: 'var(--font-sans)',
            resize: 'both',
            padding: '4px 8px',
            lineHeight: 1.3,
          }}
        />
      ) : (
        <div
          style={{
            color: element.color || '#f8fafc',
            fontSize: `${element.fontSize || 18}px`,
            fontWeight: element.fontWeight || 'normal',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'none',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
          }}
        >
          {element.text || <span style={{ opacity: 0.4 }}>Empty text</span>}
        </div>
      )}
    </div>
  );
};
