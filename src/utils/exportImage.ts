import { toPng } from 'html-to-image';
import type { 
  CanvasItem, 
  EmojiItem, 
  TextItem, 
  ShapeItem,
  BrushItem,
  CanvasBackground, 
  GradientBackground,
  PatternBackground,
} from '@/hooks/useCanvasStore';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildGradientCSS(bg: GradientBackground): string {
  const colorStops = bg.colors
    .map((c) => `${c.color} ${Math.round(c.stop * 100)}%`)
    .join(', ');

  if (bg.type === 'linear') {
    return `linear-gradient(${bg.angle}deg, ${colorStops})`;
  } else if (bg.type === 'radial') {
    return `radial-gradient(circle, ${colorStops})`;
  } else {
    return `conic-gradient(from ${bg.angle}deg, ${colorStops})`;
  }
}

function buildPatternCSS(bg: PatternBackground): { backgroundImage: string; backgroundSize: string; backgroundColor: string } {
  const size = bg.size;
  const patternColor = bg.color;
  const bgColor = bg.backgroundColor;

  switch (bg.pattern) {
    case 'dots':
      return {
        backgroundImage: `radial-gradient(${patternColor} 2px, transparent 2px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: bgColor,
      };
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${patternColor}22 1px, transparent 1px), linear-gradient(90deg, ${patternColor}22 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: bgColor,
      };
    case 'lines':
      return {
        backgroundImage: `repeating-linear-gradient(90deg, ${patternColor}22, ${patternColor}22 2px, transparent 2px, transparent ${size}px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: bgColor,
      };
    case 'diagonal':
      return {
        backgroundImage: `repeating-linear-gradient(45deg, ${patternColor}22, ${patternColor}22 2px, transparent 2px, transparent ${size}px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: bgColor,
      };
    case 'waves':
      return {
        backgroundImage: `
          radial-gradient(circle at 50% 0%, transparent 40%, ${patternColor}22 40%, ${patternColor}22 50%, transparent 50%),
          radial-gradient(circle at 50% 100%, transparent 40%, ${patternColor}22 40%, ${patternColor}22 50%, transparent 50%)
        `,
        backgroundSize: `${size}px ${size / 2}px`,
        backgroundColor: bgColor,
      };
    case 'zigzag':
      return {
        backgroundImage: `
          linear-gradient(135deg, ${patternColor}22 25%, transparent 25%) 0 0,
          linear-gradient(225deg, ${patternColor}22 25%, transparent 25%) 0 0,
          linear-gradient(315deg, ${patternColor}22 25%, transparent 25%) 0 0,
          linear-gradient(45deg, ${patternColor}22 25%, transparent 25%) 0 0
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundColor: bgColor,
      };
    default:
      return { backgroundImage: '', backgroundSize: '', backgroundColor: bgColor };
  }
}

function applyBackgroundStyle(container: HTMLElement, bg: CanvasBackground) {
  const opacity = bg.opacity ?? 1;

  if (bg.mode === 'solid') {
    container.style.backgroundColor = hexToRgba(bg.color, opacity);
    return;
  }

  if (bg.mode === 'gradient') {
    const gradient = buildGradientCSS(bg);
    if (opacity >= 1) {
      container.style.background = gradient;
    } else {
      container.style.backgroundImage = `linear-gradient(to right, rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity})), ${gradient}`;
    }
    return;
  }

  if (bg.mode === 'pattern') {
    const pattern = buildPatternCSS(bg);
    if (opacity >= 1) {
      container.style.backgroundImage = pattern.backgroundImage;
      container.style.backgroundSize = pattern.backgroundSize;
      container.style.backgroundColor = pattern.backgroundColor;
    } else {
      container.style.backgroundImage = `linear-gradient(to right, rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity})), ${pattern.backgroundImage}`;
      container.style.backgroundSize = `${pattern.backgroundSize}, ${pattern.backgroundSize}`;
      container.style.backgroundColor = pattern.backgroundColor;
    }
    return;
  }
}

export async function exportItemsAsPng(
  items: CanvasItem[],
  canvasWidth: number,
  canvasHeight: number,
  background: CanvasBackground
): Promise<string> {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${canvasWidth}px;
    height: ${canvasHeight}px;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  `;

  applyBackgroundStyle(container, background);

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

  sortedItems.forEach((item) => {
    if (item.type === 'emoji') {
      const emojiItem = item as EmojiItem;
      const size = 80 * emojiItem.scale;
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${emojiItem.x}px;
        top: ${emojiItem.y}px;
        width: ${size}px;
        height: ${size}px;
        z-index: ${emojiItem.zIndex};
        transform: rotate(${emojiItem.rotation}deg);
        font-size: ${size * 0.8}px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      `;
      el.textContent = emojiItem.emoji;
      container.appendChild(el);
    } else if (item.type === 'text') {
      const textItem = item as TextItem;
      const fontSize = textItem.style.fontSize * textItem.scale;
      const textShadow = textItem.style.shadowBlur > 0 || textItem.style.shadowOffsetX !== 0 || textItem.style.shadowOffsetY !== 0
        ? `${textItem.style.shadowOffsetX}px ${textItem.style.shadowOffsetY}px ${textItem.style.shadowBlur}px ${textItem.style.shadowColor}`
        : 'none';
      
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${textItem.x}px;
        top: ${textItem.y}px;
        z-index: ${textItem.zIndex};
        transform: rotate(${textItem.rotation}deg);
        font-family: ${textItem.style.fontFamily};
        font-size: ${fontSize}px;
        font-weight: bold;
        color: ${textItem.style.color};
        text-shadow: ${textShadow};
        -webkit-text-stroke: ${textItem.style.strokeWidth > 0 ? textItem.style.strokeWidth + 'px ' + textItem.style.strokeColor : 'none'};
        paint-order: stroke fill;
        line-height: 1.2;
        white-space: nowrap;
      `;
      el.textContent = textItem.text;
      container.appendChild(el);
    } else if (item.type === 'shape') {
      const shapeItem = item as ShapeItem;
      const { style, shapeType, width, height, x, y, rotation, zIndex, scale } = shapeItem;
      const scaledWidth = width * scale;
      const scaledHeight = height * scale;
      
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        z-index: ${zIndex};
        transform: rotate(${rotation}deg);
        opacity: ${style.opacity};
      `;

      if (shapeType === 'rectangle') {
        el.style.width = `${scaledWidth}px`;
        el.style.height = `${scaledHeight}px`;
        el.style.backgroundColor = style.fill;
        el.style.border = `${style.strokeWidth}px solid ${style.stroke}`;
        el.style.borderRadius = `${style.borderRadius}px`;
      } else if (shapeType === 'circle') {
        el.style.width = `${scaledWidth}px`;
        el.style.height = `${scaledHeight}px`;
        el.style.backgroundColor = style.fill;
        el.style.border = `${style.strokeWidth}px solid ${style.stroke}`;
        el.style.borderRadius = '50%';
      } else if (shapeType === 'ellipse') {
        el.style.width = `${scaledWidth}px`;
        el.style.height = `${scaledHeight}px`;
        el.style.backgroundColor = style.fill;
        el.style.border = `${style.strokeWidth}px solid ${style.stroke}`;
        el.style.borderRadius = '50% / 50%';
      } else if (shapeType === 'triangle' || shapeType === 'star' || shapeType === 'line') {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', String(scaledWidth));
        svg.setAttribute('height', String(scaledHeight));
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        
        if (shapeType === 'triangle') {
          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', `${width / 2},0 ${width},${height} 0,${height}`);
          polygon.setAttribute('fill', style.fill);
          polygon.setAttribute('stroke', style.stroke);
          polygon.setAttribute('stroke-width', String(style.strokeWidth));
          svg.appendChild(polygon);
        } else if (shapeType === 'star') {
          const cx = width / 2;
          const cy = height / 2;
          const outerR = Math.min(width, height) / 2;
          const innerR = outerR * 0.4;
          const spikes = 5;
          let starPoints = '';
          for (let i = 0; i < spikes * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            starPoints += `${px},${py} `;
          }
          const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
          polygon.setAttribute('points', starPoints.trim());
          polygon.setAttribute('fill', style.fill);
          polygon.setAttribute('stroke', style.stroke);
          polygon.setAttribute('stroke-width', String(style.strokeWidth));
          svg.appendChild(polygon);
        } else if (shapeType === 'line') {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '0');
          line.setAttribute('y1', String(height / 2));
          line.setAttribute('x2', String(width));
          line.setAttribute('y2', String(height / 2));
          line.setAttribute('stroke', style.stroke);
          line.setAttribute('stroke-width', String(style.strokeWidth || 2));
          line.setAttribute('stroke-linecap', 'round');
          svg.appendChild(line);
        }
        
        el.appendChild(svg);
      }
      
      container.appendChild(el);
    } else if (item.type === 'brush') {
      const brushItem = item as BrushItem;
      const { points, style, x, y, rotation, zIndex, scale } = brushItem;
      
      if (points.length < 2) return;
      
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const boundsWidth = (Math.max(...xs) - Math.min(...xs) + style.strokeWidth * 2) * scale;
      const boundsHeight = (Math.max(...ys) - Math.min(...ys) + style.strokeWidth * 2) * scale;
      
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        z-index: ${zIndex};
        transform: rotate(${rotation}deg);
      `;
      
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', String(boundsWidth));
      svg.setAttribute('height', String(boundsHeight));
      svg.style.overflow = 'visible';
      svg.style.opacity = String(style.opacity);
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let pathData = `M ${points[0].x} ${points[0].y}`;
      const smoothness = style.smoothness || 0.5;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        if (smoothness > 0 && i < points.length - 1) {
          const next = points[i + 1];
          const cpx = curr.x + (next.x - prev.x) * smoothness * 0.5;
          const cpy = curr.y + (next.y - prev.y) * smoothness * 0.5;
          pathData += ` Q ${curr.x} ${curr.y} ${cpx} ${cpy}`;
        } else {
          pathData += ` L ${curr.x} ${curr.y}`;
        }
      }
      path.setAttribute('d', pathData);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', style.color);
      path.setAttribute('stroke-width', String(style.strokeWidth * scale));
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(path);
      
      el.appendChild(svg);
      container.appendChild(el);
    }
  });

  document.body.appendChild(container);

  try {
    const dataUrl = await toPng(container, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

export async function exportEmojisAsPng(
  items: CanvasItem[],
  canvasWidth: number,
  canvasHeight: number,
  background: CanvasBackground
): Promise<string> {
  return exportItemsAsPng(items, canvasWidth, canvasHeight, background);
}

export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
}

export function downloadImage(dataUrl: string, filename: string = 'emoji-combo.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
