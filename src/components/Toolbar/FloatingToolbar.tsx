import { useState, type ReactNode } from 'react';
import {
  MousePointer,
  Hand,
  StickyNote as StickyIcon,
  PenTool,
  Highlighter,
  Square,
  Circle,
  Diamond,
  Star,
  MessageSquare,
  ArrowUpRight,
  Type,
  Eraser,
  ZoomIn,
  ZoomOut,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import type { ShapeType, ToolType } from '../../types/canvas';

interface FloatingToolbarProps {
  activeTool: ToolType;
  selectedColor: string;
  strokeWidth: number;
  selectedShapeType: ShapeType;
  zoom: number;
  selectedCount: number;
  isHistoricalPreview?: boolean;
  onSelectTool: (tool: ToolType) => void;
  onSelectColor: (color: string) => void;
  onSelectStrokeWidth: (width: number) => void;
  onSelectShapeType: (shape: ShapeType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onDeleteSelected: () => void;
  onClearCanvas: () => void;
}

const PALETTE = [
  { color: '#38bdf8', label: 'Cyan' },
  { color: '#a855f7', label: 'Violet' },
  { color: '#10b981', label: 'Emerald' },
  { color: '#f43f5e', label: 'Rose' },
  { color: '#f59e0b', label: 'Amber' },
  { color: '#fef08a', label: 'Pastel Yellow' },
  { color: '#bbf7d0', label: 'Pastel Mint' },
  { color: '#bfdbfe', label: 'Pastel Sky' },
  { color: '#f8fafc', label: 'Pure White' },
];

const SHAPES: { type: ShapeType; label: string; icon: ReactNode }[] = [
  { type: 'rectangle', label: 'Rectangle', icon: <Square size={16} /> },
  { type: 'rounded-rect', label: 'Rounded Card', icon: <Square size={16} style={{ borderRadius: '4px' }} /> },
  { type: 'circle', label: 'Circle', icon: <Circle size={16} /> },
  { type: 'diamond', label: 'Diamond', icon: <Diamond size={16} /> },
  { type: 'star', label: 'Star', icon: <Star size={16} /> },
  { type: 'callout', label: 'Callout', icon: <MessageSquare size={16} /> },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  activeTool,
  selectedColor,
  strokeWidth,
  selectedShapeType,
  zoom,
  selectedCount,
  isHistoricalPreview = false,
  onSelectTool,
  onSelectColor,
  onSelectStrokeWidth,
  onSelectShapeType,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onDeleteSelected,
  onClearCanvas,
}) => {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        top: '72px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '16px',
        padding: '6px 10px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.45), 0 2px 4px rgba(0,0,0,0.3)',
        pointerEvents: isHistoricalPreview ? 'none' : 'auto',
        opacity: isHistoricalPreview ? 0.6 : 1,
      }}
    >
      {/* Tool: Select */}
      <button
        onClick={() => onSelectTool('select')}
        style={{
          background: activeTool === 'select' ? '#38bdf8' : 'transparent',
          color: activeTool === 'select' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Select & Move (V)"
      >
        <MousePointer size={18} />
      </button>

      {/* Tool: Hand (Pan) */}
      <button
        onClick={() => onSelectTool('hand')}
        style={{
          background: activeTool === 'hand' ? '#38bdf8' : 'transparent',
          color: activeTool === 'hand' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Hand / Pan (H or Spacebar)"
      >
        <Hand size={18} />
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Tool: Sticky Note */}
      <button
        onClick={() => onSelectTool('sticky')}
        style={{
          background: activeTool === 'sticky' ? '#38bdf8' : 'transparent',
          color: activeTool === 'sticky' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Sticky Note (S)"
      >
        <StickyIcon size={18} />
      </button>

      {/* Tool: Freehand Pen */}
      <button
        onClick={() => onSelectTool('pen')}
        style={{
          background: activeTool === 'pen' ? '#38bdf8' : 'transparent',
          color: activeTool === 'pen' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Freehand Pen (P)"
      >
        <PenTool size={18} />
      </button>

      {/* Tool: Highlighter */}
      <button
        onClick={() => onSelectTool('highlighter')}
        style={{
          background: activeTool === 'highlighter' ? '#38bdf8' : 'transparent',
          color: activeTool === 'highlighter' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Neon Highlighter"
      >
        <Highlighter size={18} />
      </button>

      {/* Tool: Shapes with Dropdown Selector */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            onSelectTool('shape');
            setShowShapeMenu(!showShapeMenu);
          }}
          style={{
            background: activeTool === 'shape' ? '#38bdf8' : 'transparent',
            color: activeTool === 'shape' ? '#0f172a' : '#94a3b8',
            border: 'none',
            borderRadius: '10px',
            height: '36px',
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Geometric Shapes (R)"
        >
          <Square size={17} />
          <ChevronDown size={12} />
        </button>

        {showShapeMenu && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              left: 0,
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
              zIndex: 1100,
              minWidth: '140px',
            }}
          >
            {SHAPES.map((sh) => (
              <button
                key={sh.type}
                onClick={() => {
                  onSelectShapeType(sh.type);
                  onSelectTool('shape');
                  setShowShapeMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: selectedShapeType === sh.type ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  color: selectedShapeType === sh.type ? '#38bdf8' : '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {sh.icon}
                <span>{sh.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tool: Arrow Connector */}
      <button
        onClick={() => onSelectTool('arrow')}
        style={{
          background: activeTool === 'arrow' ? '#38bdf8' : 'transparent',
          color: activeTool === 'arrow' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Arrow Connector (A)"
      >
        <ArrowUpRight size={18} />
      </button>

      {/* Tool: Text */}
      <button
        onClick={() => onSelectTool('text')}
        style={{
          background: activeTool === 'text' ? '#38bdf8' : 'transparent',
          color: activeTool === 'text' ? '#0f172a' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Text Block (T)"
      >
        <Type size={18} />
      </button>

      {/* Tool: Eraser */}
      <button
        onClick={() => onSelectTool('eraser')}
        style={{
          background: activeTool === 'eraser' ? '#f43f5e' : 'transparent',
          color: activeTool === 'eraser' ? '#ffffff' : '#94a3b8',
          border: 'none',
          borderRadius: '10px',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        title="Eraser (E)"
      >
        <Eraser size={18} />
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Color Palette Indicator & Picker */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowPalette(!showPalette)}
          style={{
            background: 'none',
            border: 'none',
            padding: '4px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          title="Color Palette"
        >
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: selectedColor,
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: `0 0 8px ${selectedColor}66`,
            }}
          />
          <ChevronDown size={11} color="#94a3b8" />
        </button>

        {showPalette && (
          <div
            style={{
              position: 'absolute',
              top: '46px',
              left: '-20px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '14px',
              padding: '10px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.6)',
              zIndex: 1100,
            }}
          >
            {PALETTE.map((p) => (
              <button
                key={p.color}
                onClick={() => {
                  onSelectColor(p.color);
                  setShowPalette(false);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  border: selectedColor === p.color ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer',
                  boxShadow: selectedColor === p.color ? `0 0 10px ${p.color}` : 'none',
                }}
                title={p.label}
              />
            ))}
          </div>
        )}
      </div>

      {/* Stroke Width Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0 4px' }}>
        {[2, 4, 8].map((w) => (
          <button
            key={w}
            onClick={() => onSelectStrokeWidth(w)}
            style={{
              width: '22px',
              height: '22px',
              borderRadius: '6px',
              border: strokeWidth === w ? '1px solid #38bdf8' : '1px solid transparent',
              backgroundColor: strokeWidth === w ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: strokeWidth === w ? '#38bdf8' : '#64748b',
              fontSize: '10px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`Stroke ${w}px`}
          >
            {w}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Zoom Controls */}
      <button
        onClick={onZoomOut}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Zoom Out (-)"
      >
        <ZoomOut size={16} />
      </button>

      <span
        onClick={onResetZoom}
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#cbd5e1',
          cursor: 'pointer',
          padding: '2px 4px',
          userSelect: 'none',
        }}
        title="Reset Zoom to 100%"
      >
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomIn}
        style={{
          background: 'none',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
        title="Zoom In (+)"
      >
        <ZoomIn size={16} />
      </button>

      {/* Delete Selected (if any selected) */}
      {selectedCount > 0 ? (
        <>
          <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <button
            onClick={onDeleteSelected}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
              borderRadius: '8px',
              padding: '5px 8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Delete Selected Elements (Del/Backspace)"
          >
            <Trash2 size={13} />
            <span>{selectedCount}</span>
          </button>
        </>
      ) : (
        <button
          onClick={() => {
            if (window.confirm('Clear all elements on canvas?')) {
              onClearCanvas();
            }
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Clear Canvas"
        >
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
};
