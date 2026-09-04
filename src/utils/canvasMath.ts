import type { Viewport } from '../types/canvas';

export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  rect: DOMRect
): { x: number; y: number } {
  const relativeX = screenX - rect.left;
  const relativeY = screenY - rect.top;
  return {
    x: (relativeX - viewport.x) / viewport.zoom,
    y: (relativeY - viewport.y) / viewport.zoom,
  };
}

export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport,
  rect: DOMRect
): { x: number; y: number } {
  return {
    x: worldX * viewport.zoom + viewport.x + rect.left,
    y: worldY * viewport.zoom + viewport.y + rect.top,
  };
}

// Convert an array of freehand points into a smooth SVG bezier path
export function pointsToSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
  }

  // Last point
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  d += ` Q ${secondLast.x} ${secondLast.y}, ${last.x} ${last.y}`;

  return d;
}

export function getPointsBounds(points: { x: number; y: number }[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(20, maxX - minX),
    height: Math.max(20, maxY - minY),
  };
}
