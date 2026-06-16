import { toPng } from 'html-to-image';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import type { 
  CanvasItem, 
  EmojiItem, 
  TextItem, 
  ShapeItem,
  BrushItem,
  CanvasBackground, 
  GradientBackground,
  PatternBackground,
  FrameBorderConfig,
  SpeechBubble,
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

function renderFrameBorder(container: HTMLElement, border: FrameBorderConfig, width: number, height: number) {
  if (border.style === 'none') return;
  
  const borderEl = document.createElement('div');
  borderEl.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: ${width}px;
    height: ${height}px;
    pointer-events: none;
    border-radius: ${border.radius}px;
    box-sizing: border-box;
  `;

  switch (border.style) {
    case 'solid':
      borderEl.style.border = `${border.width}px solid ${border.color}`;
      break;
    case 'dashed':
      borderEl.style.border = `${border.width}px dashed ${border.color}`;
      break;
    case 'dotted':
      borderEl.style.border = `${border.width}px dotted ${border.color}`;
      break;
    case 'double':
      borderEl.style.border = `${border.width}px double ${border.color}`;
      break;
    case 'comic':
      borderEl.style.border = `${border.width + 1}px solid ${border.color}`;
      borderEl.style.boxShadow = `3px 3px 0 ${border.color}`;
      borderEl.style.transform = 'rotate(-0.5deg)';
      break;
    case 'movie':
      borderEl.style.background = `
        repeating-linear-gradient(
          0deg,
          ${border.color} 0px,
          ${border.color} ${border.width + 4}px,
          transparent ${border.width + 4}px,
          transparent ${border.width + 14}px
        ),
        repeating-linear-gradient(
          90deg,
          ${border.color} 0px,
          ${border.color} ${border.width + 4}px,
          transparent ${border.width + 4}px,
          transparent ${border.width + 14}px
        )
      `;
      break;
  }

  container.appendChild(borderEl);
}

function renderSpeechBubble(container: HTMLElement, bubble: SpeechBubble) {
  const bubbleEl = document.createElement('div');
  
  const baseStyle = `
    position: absolute;
    left: ${bubble.x}px;
    top: ${bubble.y}px;
    width: ${bubble.width}px;
    min-height: 40px;
    background-color: ${bubble.backgroundColor};
    color: ${bubble.textColor};
    font-size: ${bubble.fontSize}px;
    font-family: Arial, sans-serif;
    padding: 10px 16px;
    border: 2px solid ${bubble.borderColor};
    z-index: 100;
    box-sizing: border-box;
    word-wrap: break-word;
    white-space: pre-wrap;
  `;

  switch (bubble.style) {
    case 'round':
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
      `;
      break;
    case 'speech':
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 16px;
        filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
      `;
      break;
    case 'thought':
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 20px;
        border-style: dashed;
      `;
      break;
    case 'shout':
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 8px;
        font-weight: bold;
        text-transform: uppercase;
        transform: rotate(-1deg);
        box-shadow: 3px 3px 0 ${bubble.borderColor};
      `;
      break;
    case 'whisper':
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 20px;
        font-style: italic;
        opacity: 0.85;
        border-style: dotted;
      `;
      break;
    default:
      bubbleEl.style.cssText = baseStyle + `
        border-radius: 12px;
      `;
  }

  bubbleEl.textContent = bubble.text;

  if (bubble.style === 'thought') {
    const tailContainer = document.createElement('div');
    tailContainer.style.cssText = `
      position: absolute;
      display: flex;
      align-items: flex-end;
      gap: 4px;
    `;
    
    let tailStyle = '';
    switch (bubble.tailPosition) {
      case 'bottom':
        tailStyle = 'bottom: -16px; left: 20px; flex-direction: row;';
        break;
      case 'top':
        tailStyle = 'top: -16px; left: 20px; flex-direction: row-reverse;';
        break;
      case 'left':
        tailStyle = 'left: -16px; top: 20px; flex-direction: column;';
        break;
      case 'right':
        tailStyle = 'right: -16px; top: 20px; flex-direction: column-reverse;';
        break;
    }
    tailContainer.style.cssText += tailStyle;

    for (let i = 0; i < 3; i++) {
      const circle = document.createElement('div');
      circle.style.cssText = `
        width: ${8 - i * 2}px;
        height: ${8 - i * 2}px;
        border-radius: 50%;
        background-color: ${bubble.backgroundColor};
        border: 2px solid ${bubble.borderColor};
      `;
      tailContainer.appendChild(circle);
    }
    bubbleEl.appendChild(tailContainer);
  } else if (bubble.style === 'speech' || bubble.style === 'shout' || bubble.style === 'whisper') {
    const tailSize = 14;
    const tail = document.createElement('div');
    tail.style.cssText = `
      position: absolute;
      width: 0;
      height: 0;
      border-style: solid;
    `;

    switch (bubble.tailPosition) {
      case 'bottom':
        tail.style.cssText += `
          bottom: -${tailSize - 2}px;
          left: 24px;
          border-width: ${tailSize}px ${tailSize / 2}px 0 ${tailSize / 2}px;
          border-color: ${bubble.borderColor} transparent transparent transparent;
        `;
        break;
      case 'top':
        tail.style.cssText += `
          top: -${tailSize - 2}px;
          left: 24px;
          border-width: 0 ${tailSize / 2}px ${tailSize}px ${tailSize / 2}px;
          border-color: transparent transparent ${bubble.borderColor} transparent;
        `;
        break;
      case 'left':
        tail.style.cssText += `
          left: -${tailSize - 2}px;
          top: 20px;
          border-width: ${tailSize / 2}px ${tailSize}px ${tailSize / 2}px 0;
          border-color: transparent ${bubble.borderColor} transparent transparent;
        `;
        break;
      case 'right':
        tail.style.cssText += `
          right: -${tailSize - 2}px;
          top: 20px;
          border-width: ${tailSize / 2}px 0 ${tailSize / 2}px ${tailSize}px;
          border-color: transparent transparent transparent ${bubble.borderColor};
        `;
        break;
    }
    bubbleEl.appendChild(tail);
  }

  container.appendChild(bubbleEl);
}

function renderFrameItems(container: HTMLElement, items: CanvasItem[]) {
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
}

export async function exportStoryAsLongImage(): Promise<void> {
  const state = useCanvasStore.getState();
  const { frames, storyTitle, showStoryTitle, storyTitleStyle, canvasSize, saveCurrentFrameToStory } = state;
  
  saveCurrentFrameToStory();
  
  const sortedFrames = [...frames].sort((a, b) => a.order - b.order);
  const padding = 40;
  const frameGap = 30;
  const titleHeight = showStoryTitle ? storyTitleStyle.fontSize + 40 : 0;
  const frameCountHeight = 30;
  const totalHeight = titleHeight + sortedFrames.length * (canvasSize.height + frameGap + frameCountHeight) - frameGap + padding * 2;
  const totalWidth = canvasSize.width + padding * 2;

  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${totalWidth}px;
    height: ${totalHeight}px;
    background: linear-gradient(135deg, #fff5f7 0%, #f5f3ff 50%, #f0f9ff 100%);
    padding: ${padding}px;
    box-sizing: border-box;
    z-index: -1;
  `;

  let currentY = padding;

  if (showStoryTitle) {
    const titleEl = document.createElement('div');
    titleEl.style.cssText = `
      text-align: center;
      font-family: ${storyTitleStyle.fontFamily};
      font-size: ${storyTitleStyle.fontSize}px;
      font-weight: bold;
      color: ${storyTitleStyle.color};
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 3px solid rgba(168, 85, 247, 0.3);
    `;
    titleEl.textContent = storyTitle;
    container.appendChild(titleEl);
    currentY = titleHeight + padding;
  }

  for (let i = 0; i < sortedFrames.length; i++) {
    const frame = sortedFrames[i];
    const frameY = currentY + frameCountHeight;

    const frameLabel = document.createElement('div');
    frameLabel.style.cssText = `
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
      font-family: Arial, sans-serif;
    `;
    frameLabel.textContent = frame.title;
    container.appendChild(frameLabel);

    const frameContainer = document.createElement('div');
    frameContainer.style.cssText = `
      position: absolute;
      left: ${padding}px;
      top: ${frameY}px;
      width: ${canvasSize.width}px;
      height: ${canvasSize.height}px;
      overflow: hidden;
      border-radius: ${frame.border.radius}px;
    `;

    applyBackgroundStyle(frameContainer, frame.background);
    renderFrameItems(frameContainer, frame.items);
    frame.speechBubbles.forEach(bubble => renderSpeechBubble(frameContainer, bubble));
    renderFrameBorder(frameContainer, frame.border, canvasSize.width, canvasSize.height);

    container.appendChild(frameContainer);

    currentY = frameY + canvasSize.height + frameGap;
  }

  document.body.appendChild(container);

  try {
    const dataUrl = await toPng(container, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });

    const link = document.createElement('a');
    link.download = `story-${Date.now()}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export story:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}
