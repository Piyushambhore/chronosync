import type { CanvasItem } from '../types/canvas';

// Export canvas items to high-res PNG image
export function exportCanvasToPng(
  elements: CanvasItem[],
  roomName: string,
  options: { transparent?: boolean } = {}
) {
  if (elements.length === 0) {
    alert('Canvas is empty. Add elements before exporting!');
    return;
  }

  // Calculate total bounding box of all elements
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  elements.forEach((el) => {
    if (el.x < minX) minX = el.x;
    if (el.y < minY) minY = el.y;
    if (el.x + el.width > maxX) maxX = el.x + el.width;
    if (el.y + el.height > maxY) maxY = el.y + el.height;
  });

  const padding = 80;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(400, maxX - minX);
  const height = Math.max(300, maxY - minY);

  const canvas = document.createElement('canvas');
  // Scale for retina 2x sharpness
  const pixelRatio = 2;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(pixelRatio, pixelRatio);

  // Background
  if (!options.transparent) {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid dots
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let gx = 0; gx < width; gx += 28) {
      for (let gy = 0; gy < height; gy += 28) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Draw items sorted by zIndex
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  sorted.forEach((el) => {
    const rx = el.x - minX;
    const ry = el.y - minY;

    ctx.save();

    if (el.type === 'sticky') {
      // Sticky Note
      ctx.fillStyle = el.color || '#fef08a';
      ctx.beginPath();
      ctx.roundRect(rx, ry, el.width, el.height, 12);
      ctx.fill();

      // Shadow
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 10;

      // Header Tag
      ctx.fillStyle = '#334155';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(el.authorName || 'Note', rx + 14, ry + 22);

      // Text
      ctx.fillStyle = '#0f172a';
      ctx.font = '14px sans-serif';
      const lines = el.text.split('\n');
      lines.forEach((line, i) => {
        if (ry + 45 + i * 20 < ry + el.height - 10) {
          ctx.fillText(line, rx + 14, ry + 45 + i * 20);
        }
      });
    } else if (el.type === 'shape') {
      // Geometric Shape
      ctx.strokeStyle = el.strokeColor || '#38bdf8';
      ctx.fillStyle = el.fillColor || 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = el.strokeWidth || 2;

      ctx.beginPath();
      if (el.shapeType === 'circle') {
        ctx.ellipse(rx + el.width / 2, ry + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
      } else if (el.shapeType === 'diamond') {
        ctx.moveTo(rx + el.width / 2, ry);
        ctx.lineTo(rx + el.width, ry + el.height / 2);
        ctx.lineTo(rx + el.width / 2, ry + el.height);
        ctx.lineTo(rx, ry + el.height / 2);
        ctx.closePath();
      } else {
        ctx.roundRect(rx, ry, el.width, el.height, el.shapeType === 'rounded-rect' ? 16 : 6);
      }
      ctx.fill();
      ctx.stroke();

      if (el.label) {
        ctx.fillStyle = '#f8fafc';
        ctx.font = '500 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(el.label, rx + el.width / 2, ry + el.height / 2);
      }
    } else if (el.type === 'drawing') {
      // Freehand Path
      if (el.points.length > 1) {
        ctx.strokeStyle = el.strokeColor || '#38bdf8';
        ctx.lineWidth = el.strokeWidth || 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (el.isHighlighter) {
          ctx.globalAlpha = 0.35;
        }

        ctx.beginPath();
        const start = el.points[0];
        ctx.moveTo(start.x - minX, start.y - minY);

        for (let i = 1; i < el.points.length - 1; i++) {
          const xc = (el.points[i].x + el.points[i + 1].x) / 2 - minX;
          const yc = (el.points[i].y + el.points[i + 1].y) / 2 - minY;
          ctx.quadraticCurveTo(el.points[i].x - minX, el.points[i].y - minY, xc, yc);
        }
        const last = el.points[el.points.length - 1];
        ctx.lineTo(last.x - minX, last.y - minY);
        ctx.stroke();
      }
    } else if (el.type === 'arrow') {
      // Arrow Connector
      ctx.strokeStyle = el.strokeColor || '#38bdf8';
      ctx.lineWidth = el.strokeWidth || 2.5;

      const sx = el.startX - minX;
      const sy = el.startY - minY;
      const ex = el.endX - minX;
      const ey = el.endY - minY;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Arrow head
      const angle = Math.atan2(ey - sy, ex - sx);
      const headLen = 12;
      ctx.fillStyle = el.strokeColor || '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    } else if (el.type === 'text') {
      ctx.fillStyle = el.color || '#f8fafc';
      ctx.font = `${el.fontSize || 18}px sans-serif`;
      ctx.fillText(el.text, rx, ry + (el.fontSize || 18));
    }

    ctx.restore();
  });

  // Trigger Download
  const link = document.createElement('a');
  link.download = `${roomName}-chronosync-export.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
