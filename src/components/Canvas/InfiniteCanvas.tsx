import { useRef, useState, useEffect, useCallback } from 'react';
import type {
  CanvasItem,
  DrawingElement,
  PeerUser,
  ShapeType,
  ToolType,
  Viewport,
} from '../../types/canvas';
import { screenToWorld, pointsToSvgPath, getPointsBounds } from '../../utils/canvasMath';
import { StickyNote } from './Elements/StickyNote';
import { ShapeElement } from './Elements/ShapeElement';
import { DrawingPath } from './Elements/DrawingPath';
import { ArrowElement } from './Elements/ArrowElement';
import { TextElement } from './Elements/TextElement';
import { ImageElement } from './Elements/ImageElement';
import { CursorOverlay } from './CursorOverlay';
import { soundFX } from '../../utils/soundEffects';

interface InfiniteCanvasProps {
  elements: CanvasItem[];
  selectedIds: string[];
  activeTool: ToolType;
  selectedColor: string;
  strokeWidth: number;
  selectedShapeType: ShapeType;
  peers: PeerUser[];
  currentUserName: string;
  viewport: Viewport;
  setViewport: React.Dispatch<React.SetStateAction<Viewport>>;
  isHistoricalPreview?: boolean;
  onSelectElements: (ids: string[]) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasItem>) => void;
  onCreateElement: (element: CanvasItem, commitDesc?: string) => void;
  onDeleteElements: (ids: string[]) => void;
  onCursorMove: (worldPos: { x: number; y: number } | null) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  elements,
  selectedIds,
  activeTool,
  selectedColor,
  strokeWidth,
  selectedShapeType,
  peers,
  currentUserName,
  viewport,
  setViewport,
  isHistoricalPreview = false,
  onSelectElements,
  onUpdateElement,
  onCreateElement,
  onDeleteElements,
  onCursorMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Active interaction states
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState(false);

  // Active Drawing Stroke (for pen / highlighter)
  const [activeDrawingPoints, setActiveDrawingPoints] = useState<{ x: number; y: number }[] | null>(null);

  // Active Drag-to-Create Shape / Arrow
  const [dragCreateStart, setDragCreateStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCreateCurrent, setDragCreateCurrent] = useState<{ x: number; y: number } | null>(null);

  // Dragging Existing Elements
  const [draggingElements, setDraggingElements] = useState<{
    elementId: string;
    startX: number;
    startY: number;
    initialPositions: { [id: string]: { x: number; y: number } };
  } | null>(null);

  // Keyboard space listener for quick panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [spacePressed]);

  // Keyboard clipboard paste handler for images (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isHistoricalPreview || !containerRef.current) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (readEv) => {
            const src = readEv.target?.result as string;
            const img = new Image();
            img.onload = () => {
              const aspect = img.width / img.height;
              const width = Math.min(360, img.width);
              const height = width / aspect;
              const centerWorldX = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
              const centerWorldY = (-viewport.y + window.innerHeight / 2) / viewport.zoom;
              const newImgEl: CanvasItem = {
                id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
                type: 'image',
                x: Math.round(centerWorldX - width / 2),
                y: Math.round(centerWorldY - height / 2),
                width: Math.round(width),
                height: Math.round(height),
                aspectRatio: aspect,
                src,
                zIndex: elements.length + 1,
                createdBy: currentUserName,
                authorName: currentUserName,
                updatedAt: Date.now(),
              };
              onCreateElement(newImgEl, 'Pasted Image from Clipboard');
              onSelectElements([newImgEl.id]);
              soundFX.playPop();
            };
            img.src = src;
          };
          reader.readAsDataURL(file);
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isHistoricalPreview, viewport, currentUserName, elements.length, onCreateElement, onSelectElements]);
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!containerRef.current) return;
      e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        // Pinch zoom or Ctrl+Wheel zoom
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        setViewport((prev) => {
          const newZoom = Math.min(3.5, Math.max(0.15, prev.zoom * zoomFactor));
          // Zoom towards cursor
          const worldX = (cursorX - prev.x) / prev.zoom;
          const worldY = (cursorY - prev.y) / prev.zoom;
          return {
            zoom: newZoom,
            x: cursorX - worldX * newZoom,
            y: cursorY - worldY * newZoom,
          };
        });
      } else {
        // Standard two-finger pan or wheel scroll
        setViewport((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    [setViewport]
  );

  // Pointer Down on Canvas
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const worldPos = screenToWorld(e.clientX, e.clientY, viewport, rect);

    // Pan mode check (Middle mouse click, Space key pressed, or Hand tool)
    if (e.button === 1 || spacePressed || activeTool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      return;
    }

    if (isHistoricalPreview) return;

    if (activeTool === 'select') {
      // Click on background deselects
      if ((e.target as HTMLElement).getAttribute('data-canvas-background')) {
        onSelectElements([]);
      }
      return;
    }

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setActiveDrawingPoints([worldPos]);
      return;
    }

    if (activeTool === 'shape' || activeTool === 'arrow') {
      setDragCreateStart(worldPos);
      setDragCreateCurrent(worldPos);
      return;
    }

    if (activeTool === 'sticky') {
      const newSticky: CanvasItem = {
        id: 'sticky_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'sticky',
        x: Math.round(worldPos.x - 90),
        y: Math.round(worldPos.y - 70),
        width: 190,
        height: 150,
        color: selectedColor || '#fef08a',
        text: '',
        zIndex: elements.length + 1,
        createdBy: currentUserName,
        authorName: currentUserName,
        updatedAt: Date.now(),
      };
      onCreateElement(newSticky, `Added Sticky Note`);
      onSelectElements([newSticky.id]);
      soundFX.playPop();
      return;
    }

    if (activeTool === 'text') {
      const newText: CanvasItem = {
        id: 'text_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'text',
        x: Math.round(worldPos.x),
        y: Math.round(worldPos.y),
        width: 180,
        height: 40,
        text: 'Type something...',
        color: '#f8fafc',
        fontSize: 20,
        zIndex: elements.length + 1,
        createdBy: currentUserName,
        authorName: currentUserName,
        updatedAt: Date.now(),
      };
      onCreateElement(newText, `Added Text`);
      onSelectElements([newText.id]);
      soundFX.playClick();
      return;
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const worldPos = screenToWorld(e.clientX, e.clientY, viewport, rect);

    // Broadcast cursor position to peers
    onCursorMove(worldPos);

    if (isPanning) {
      setViewport((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
      return;
    }

    // Freehand stroke drawing
    if (activeDrawingPoints) {
      setActiveDrawingPoints((prev) => (prev ? [...prev, worldPos] : [worldPos]));
      return;
    }

    // Drag-creating shape or arrow
    if (dragCreateStart) {
      setDragCreateCurrent(worldPos);
      return;
    }

    // Dragging selected elements
    if (draggingElements) {
      const deltaX = worldPos.x - draggingElements.startX;
      const deltaY = worldPos.y - draggingElements.startY;

      Object.entries(draggingElements.initialPositions).forEach(([id, initPos]) => {
        onUpdateElement(id, {
          x: Math.round(initPos.x + deltaX),
          y: Math.round(initPos.y + deltaY),
          updatedAt: Date.now(),
        });
      });
      return;
    }
  };

  // Pointer Up
  const handlePointerUp = () => {
    if (isPanning) {
      setIsPanning(false);
    }

    // Finalize Freehand Drawing
    if (activeDrawingPoints && activeDrawingPoints.length > 1) {
      const bounds = getPointsBounds(activeDrawingPoints);
      const isHighlighter = activeTool === 'highlighter';

      const newDrawing: DrawingElement = {
        id: 'draw_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'drawing',
        points: activeDrawingPoints,
        strokeColor: selectedColor || '#38bdf8',
        strokeWidth: isHighlighter ? strokeWidth * 3 : strokeWidth,
        isHighlighter,
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width,
        height: bounds.height,
        zIndex: elements.length + 1,
        createdBy: currentUserName,
        authorName: currentUserName,
        updatedAt: Date.now(),
      };
      onCreateElement(newDrawing, isHighlighter ? 'Highlighter stroke' : 'Freehand drawing');
    }
    setActiveDrawingPoints(null);

    // Finalize Shape Drag-Creation
    if (dragCreateStart && dragCreateCurrent) {
      const x = Math.min(dragCreateStart.x, dragCreateCurrent.x);
      const y = Math.min(dragCreateStart.y, dragCreateCurrent.y);
      const width = Math.max(50, Math.abs(dragCreateCurrent.x - dragCreateStart.x));
      const height = Math.max(50, Math.abs(dragCreateCurrent.y - dragCreateStart.y));

      if (activeTool === 'shape') {
        const newShape: CanvasItem = {
          id: 'shape_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          type: 'shape',
          shapeType: selectedShapeType,
          x: Math.round(x),
          y: Math.round(y),
          width: Math.round(width),
          height: Math.round(height),
          fillColor: `${selectedColor}22`,
          strokeColor: selectedColor || '#38bdf8',
          strokeWidth,
          label: '',
          zIndex: elements.length + 1,
          createdBy: currentUserName,
          authorName: currentUserName,
          updatedAt: Date.now(),
        };
        onCreateElement(newShape, `Created ${selectedShapeType}`);
        onSelectElements([newShape.id]);
        soundFX.playPop();
      } else if (activeTool === 'arrow') {
        const newArrow: CanvasItem = {
          id: 'arrow_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          type: 'arrow',
          startX: Math.round(dragCreateStart.x),
          startY: Math.round(dragCreateStart.y),
          endX: Math.round(dragCreateCurrent.x),
          endY: Math.round(dragCreateCurrent.y),
          strokeColor: selectedColor || '#38bdf8',
          strokeWidth,
          arrowEnd: true,
          x: Math.min(dragCreateStart.x, dragCreateCurrent.x),
          y: Math.min(dragCreateStart.y, dragCreateCurrent.y),
          width: Math.abs(dragCreateCurrent.x - dragCreateStart.x),
          height: Math.abs(dragCreateCurrent.y - dragCreateStart.y),
          zIndex: elements.length + 1,
          createdBy: currentUserName,
          authorName: currentUserName,
          updatedAt: Date.now(),
        };
        onCreateElement(newArrow, `Created Arrow Connector`);
        onSelectElements([newArrow.id]);
        soundFX.playPop();
      }
    }
    setDragCreateStart(null);
    setDragCreateCurrent(null);

    // Finalize Element Dragging
    if (draggingElements) {
      setDraggingElements(null);
    }
  };

  // Start Dragging an Element
  const handleElementPointerDownDrag = (e: React.PointerEvent, element: CanvasItem) => {
    if (isHistoricalPreview || activeTool === 'hand' || spacePressed) return;

    if (activeTool === 'eraser') {
      soundFX.playSnap();
      onDeleteElements([element.id]);
      return;
    }

    if (activeTool !== 'select') return;

    e.stopPropagation();

    // If element is not already selected, select it
    const newSelectedIds = selectedIds.includes(element.id) ? selectedIds : [element.id];
    onSelectElements(newSelectedIds);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const worldPos = screenToWorld(e.clientX, e.clientY, viewport, rect);

    const initialPositions: { [id: string]: { x: number; y: number } } = {};
    elements.forEach((el) => {
      if (newSelectedIds.includes(el.id)) {
        initialPositions[el.id] = { x: el.x, y: el.y };
      }
    });

    setDraggingElements({
      elementId: element.id,
      startX: worldPos.x,
      startY: worldPos.y,
      initialPositions,
    });
  };

  return (
    <div
      ref={containerRef}
      data-canvas-background="true"
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        onCursorMove(null);
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor:
          spacePressed || activeTool === 'hand'
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : activeTool === 'eraser'
            ? 'crosshair'
            : activeTool === 'select'
            ? 'default'
            : 'crosshair',
        backgroundColor: isHistoricalPreview ? '#090d16' : '#0a0d14',
        backgroundImage: isHistoricalPreview
          ? `radial-gradient(circle at 50% 50%, rgba(56, 189, 248, 0.08) 1px, transparent 1px)`
          : `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
        backgroundSize: `${28 * viewport.zoom}px ${28 * viewport.zoom}px`,
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        touchAction: 'none',
      }}
    >
      {/* Historical Mode Time Machine Ambient Overlay */}
      {isHistoricalPreview && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            border: '3px solid rgba(56, 189, 248, 0.5)',
            boxShadow: 'inset 0 0 100px rgba(56, 189, 248, 0.15)',
            zIndex: 900,
          }}
        />
      )}

      {/* World Space Container (Transformed via Viewport) */}
      <div
        style={{
          position: 'absolute',
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
      >
        {/* Render Canvas Elements */}
        {elements.map((el) => {
          const isSelected = selectedIds.includes(el.id);

          switch (el.type) {
            case 'sticky':
              return (
                <StickyNote
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            case 'shape':
              return (
                <ShapeElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            case 'drawing':
              return (
                <DrawingPath
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            case 'arrow':
              return (
                <ArrowElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            case 'text':
              return (
                <TextElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            case 'image':
              return (
                <ImageElement
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  isReadOnly={isHistoricalPreview}
                  onUpdate={(updates) => onUpdateElement(el.id, updates)}
                  onSelect={(e) => {
                    e.stopPropagation();
                    if (activeTool === 'eraser') {
                      onDeleteElements([el.id]);
                    } else if (activeTool === 'select') {
                      onSelectElements(e.shiftKey ? [...selectedIds, el.id] : [el.id]);
                    }
                  }}
                  onPointerDownDrag={handleElementPointerDownDrag}
                />
              );
            default:
              return null;
          }
        })}

        {/* Live Active Freehand Drawing Stroke Preview */}
        {activeDrawingPoints && activeDrawingPoints.length > 0 && (
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            <path
              d={pointsToSvgPath(activeDrawingPoints)}
              fill="none"
              stroke={selectedColor || '#38bdf8'}
              strokeWidth={activeTool === 'highlighter' ? strokeWidth * 3 : strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={activeTool === 'highlighter' ? 0.35 : 1}
              style={{
                filter: activeTool === 'highlighter' ? 'none' : `drop-shadow(0 0 5px ${selectedColor}66)`,
              }}
            />
          </svg>
        )}

        {/* Live Shape / Arrow Drag Creation Preview */}
        {dragCreateStart && dragCreateCurrent && (
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              overflow: 'visible',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          >
            {activeTool === 'arrow' ? (
              <line
                x1={dragCreateStart.x}
                y1={dragCreateStart.y}
                x2={dragCreateCurrent.x}
                y2={dragCreateCurrent.y}
                stroke={selectedColor || '#38bdf8'}
                strokeWidth={strokeWidth}
                strokeDasharray="5 5"
              />
            ) : (
              <rect
                x={Math.min(dragCreateStart.x, dragCreateCurrent.x)}
                y={Math.min(dragCreateStart.y, dragCreateCurrent.y)}
                width={Math.abs(dragCreateCurrent.x - dragCreateStart.x)}
                height={Math.abs(dragCreateCurrent.y - dragCreateStart.y)}
                fill={`${selectedColor}20`}
                stroke={selectedColor || '#38bdf8'}
                strokeWidth={strokeWidth}
                strokeDasharray="5 5"
              />
            )}
          </svg>
        )}
      </div>

      {/* Real-Time Peer Cursors Overlay */}
      <CursorOverlay peers={peers} viewport={viewport} />
    </div>
  );
};
