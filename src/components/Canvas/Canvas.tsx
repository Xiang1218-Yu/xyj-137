import { useRef, useState, useCallback, useEffect } from 'react';
import { CanvasEmoji } from './CanvasEmoji';
import { CanvasText } from './CanvasText';
import { CanvasShape } from './CanvasShape';
import { CanvasBrush } from './CanvasBrush';
import { SpeechBubble } from './SpeechBubble';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import type { EmojiItem, TextItem, ShapeItem, BrushItem, BrushPoint, DrawingTool, FrameBorderConfig } from '@/hooks/useCanvasStore';
import { buildBackgroundStyles } from '@/utils/backgroundStyles';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

const isShapeTool = (tool: DrawingTool) => 
  ['rectangle', 'circle', 'ellipse', 'triangle', 'line', 'star'].includes(tool);

const isBrushTool = (tool: DrawingTool) => tool === 'brush';
const isDrawingTool = (tool: DrawingTool) => isShapeTool(tool) || isBrushTool(tool);

function buildFrameBorderStyle(border: FrameBorderConfig): React.CSSProperties {
  if (border.style === 'none') return {};

  const base: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    borderRadius: border.radius,
  };

  switch (border.style) {
    case 'solid':
      return {
        ...base,
        border: `${border.width}px solid ${border.color}`,
      };
    case 'dashed':
      return {
        ...base,
        border: `${border.width}px dashed ${border.color}`,
      };
    case 'dotted':
      return {
        ...base,
        border: `${border.width}px dotted ${border.color}`,
      };
    case 'double':
      return {
        ...base,
        border: `${border.width}px double ${border.color}`,
      };
    case 'comic':
      return {
        ...base,
        border: `${border.width + 1}px solid ${border.color}`,
        boxShadow: `3px 3px 0 ${border.color}`,
        transform: 'rotate(-0.5deg)',
      };
    case 'movie':
      return {
        ...base,
        border: `0`,
        background: `repeating-linear-gradient(
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
        )`,
        WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: `${border.width + 2}px`,
      };
    default:
      return {};
  }
}

export function Canvas({ canvasRef }: CanvasProps) {
  const { 
    items, 
    selectedId, 
    selectItem, 
    canvasSize, 
    background,
    animationSettings,
    setCurrentFrame,
    currentTool,
    shapeStyle,
    brushStyle,
    addShape,
    addBrush,
    setCurrentTool,
    isStoryMode,
    frames,
    currentFrameId,
  } = useCanvasStore();

  const currentFrame = isStoryMode ? frames.find(f => f.id === currentFrameId) : null;
  const frameBorder = currentFrame?.border;
  const speechBubbles = currentFrame?.speechBubbles || [];

  const isDrawing = useRef(false);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const drawEndRef = useRef<{ x: number; y: number } | null>(null);
  const brushPointsRef = useRef<BrushPoint[]>([]);

  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const [brushPoints, setBrushPoints] = useState<BrushPoint[]>([]);

  const getCanvasCoordinates = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [canvasRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDrawingTool(currentTool)) return;
    
    const coords = getCanvasCoordinates(e);
    isDrawing.current = true;
    drawStartRef.current = coords;
    drawEndRef.current = coords;
    setDrawStart(coords);
    setDrawEnd(coords);
    
    if (isBrushTool(currentTool)) {
      brushPointsRef.current = [{ x: coords.x, y: coords.y, pressure: 1 }];
      setBrushPoints([{ x: coords.x, y: coords.y, pressure: 1 }]);
    }
  }, [currentTool, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing.current) return;
    const coords = getCanvasCoordinates(e);
    drawEndRef.current = coords;
    setDrawEnd(coords);
    
    if (isBrushTool(currentTool)) {
      const newPoints = [...brushPointsRef.current, { x: coords.x, y: coords.y, pressure: 1 }];
      brushPointsRef.current = newPoints;
      setBrushPoints(newPoints);
    }
  }, [currentTool, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing.current) return;
    
    const start = drawStartRef.current;
    const end = drawEndRef.current;
    
    if (!start || !end) {
      isDrawing.current = false;
      return;
    }

    if (isShapeTool(currentTool)) {
      const shapeType = currentTool as Exclude<DrawingTool, 'select' | 'brush'>;
      const width = end.x - start.x;
      const height = end.y - start.y;
      
      const minSize = 5;
      if (Math.abs(width) < minSize && Math.abs(height) < minSize) {
        isDrawing.current = false;
        drawStartRef.current = null;
        drawEndRef.current = null;
        setDrawStart(null);
        setDrawEnd(null);
        return;
      }
      
      addShape(start.x, start.y, width, height, shapeType);
      setCurrentTool('select');
    } else if (isBrushTool(currentTool)) {
      const points = brushPointsRef.current;
      if (points.length < 2) {
        isDrawing.current = false;
        brushPointsRef.current = [];
        drawStartRef.current = null;
        drawEndRef.current = null;
        setDrawStart(null);
        setDrawEnd(null);
        setBrushPoints([]);
        return;
      }
      
      const xs = points.map(p => p.x);
      const ys = points.map(p => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      
      const translatedPoints = points.map(p => ({
        x: p.x - minX + brushStyle.strokeWidth,
        y: p.y - minY + brushStyle.strokeWidth,
        pressure: p.pressure,
      }));
      
      addBrush(
        translatedPoints,
        minX - brushStyle.strokeWidth,
        minY - brushStyle.strokeWidth,
        maxX - minX + brushStyle.strokeWidth * 2,
        maxY - minY + brushStyle.strokeWidth * 2
      );
      setCurrentTool('select');
    }

    isDrawing.current = false;
    drawStartRef.current = null;
    drawEndRef.current = null;
    brushPointsRef.current = [];
    setDrawStart(null);
    setDrawEnd(null);
    setBrushPoints([]);
  }, [currentTool, addShape, addBrush, setCurrentTool, brushStyle.strokeWidth]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDrawing.current) {
      selectItem(null);
    }
  };

  useEffect(() => {
    if (!animationSettings.isPlaying) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1;
        return next >= animationSettings.frameCount ? 0 : next;
      });
    }, animationSettings.frameDelay);

    return () => clearInterval(interval);
  }, [animationSettings.isPlaying, animationSettings.frameCount, animationSettings.frameDelay, setCurrentFrame]);

  const renderPreview = () => {
    if (!drawStart || !drawEnd) return null;
    
    if (isShapeTool(currentTool)) {
      const x = Math.min(drawStart.x, drawEnd.x);
      const y = Math.min(drawStart.y, drawEnd.y);
      const width = Math.abs(drawEnd.x - drawStart.x);
      const height = Math.abs(drawEnd.y - drawStart.y);
      const shapeType = currentTool;
      const opacity = 0.8;

      const baseStyle: React.CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        pointerEvents: 'none',
        zIndex: 9999,
      };

      switch (shapeType) {
        case 'rectangle':
          return (
            <div
              style={{
                ...baseStyle,
                width,
                height,
                backgroundColor: shapeStyle.fill,
                border: `${shapeStyle.strokeWidth}px solid ${shapeStyle.stroke}`,
                borderRadius: shapeStyle.borderRadius,
              }}
            />
          );
        case 'circle':
          return (
            <div
              style={{
                ...baseStyle,
                width,
                height,
                backgroundColor: shapeStyle.fill,
                border: `${shapeStyle.strokeWidth}px solid ${shapeStyle.stroke}`,
                borderRadius: '50%',
              }}
            />
          );
        case 'ellipse':
          return (
            <div
              style={{
                ...baseStyle,
                width,
                height,
                backgroundColor: shapeStyle.fill,
                border: `${shapeStyle.strokeWidth}px solid ${shapeStyle.stroke}`,
                borderRadius: '50% / 50%',
              }}
            />
          );
        case 'triangle':
          return (
            <svg
              style={{ ...baseStyle, width, height }}
              viewBox={`0 0 ${width} ${height}`}
            >
              <polygon
                points={`${width / 2},0 ${width},${height} 0,${height}`}
                fill={shapeStyle.fill}
                stroke={shapeStyle.stroke}
                strokeWidth={shapeStyle.strokeWidth}
              />
            </svg>
          );
        case 'line':
          return (
            <svg
              style={{ ...baseStyle, width, height }}
              viewBox={`0 0 ${width} ${height}`}
            >
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke={shapeStyle.stroke}
                strokeWidth={shapeStyle.strokeWidth || 2}
                strokeLinecap="round"
              />
            </svg>
          );
        case 'star': {
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
          
          return (
            <svg
              style={{ ...baseStyle, width, height }}
              viewBox={`0 0 ${width} ${height}`}
            >
              <polygon
                points={starPoints.trim()}
                fill={shapeStyle.fill}
                stroke={shapeStyle.stroke}
                strokeWidth={shapeStyle.strokeWidth}
              />
            </svg>
          );
        }
        default:
          return null;
      }
    }

    if (isBrushTool(currentTool) && brushPoints.length > 1) {
      let path = `M ${brushPoints[0].x} ${brushPoints[0].y}`;
      const smoothness = brushStyle.smoothness || 0.5;
      
      for (let i = 1; i < brushPoints.length; i++) {
        const prev = brushPoints[i - 1];
        const curr = brushPoints[i];
        
        if (smoothness > 0 && i < brushPoints.length - 1) {
          const next = brushPoints[i + 1];
          const cpx = curr.x + (next.x - prev.x) * smoothness * 0.5;
          const cpy = curr.y + (next.y - prev.y) * smoothness * 0.5;
          path += ` Q ${curr.x} ${curr.y} ${cpx} ${cpy}`;
        } else {
          path += ` L ${curr.x} ${curr.y}`;
        }
      }
      
      return (
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            overflow: 'visible',
            opacity: 0.8,
          }}
        >
          <path
            d={path}
            fill="none"
            stroke={brushStyle.color}
            strokeWidth={brushStyle.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }

    return null;
  };

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  const bgStyles = buildBackgroundStyles(background);

  const cursor = isDrawingTool(currentTool) ? 'crosshair' : 'default';

  const canvasBorderRadius = frameBorder && frameBorder.style !== 'none' ? `${frameBorder.radius}px` : '1.5rem';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative p-8">
        {isStoryMode && currentFrame && (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg z-10">
            {currentFrame.title}
          </div>
        )}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={handleCanvasClick}
          className="relative overflow-hidden shadow-2xl"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            cursor,
            borderRadius: canvasBorderRadius,
            ...bgStyles,
          }}
        >
          <div className="absolute inset-4 border-2 border-dashed border-purple-200/50 rounded-2xl pointer-events-none" />
          
          {sortedItems.map((item) => {
            const isSelected = selectedId === item.id;
            if (item.type === 'emoji') {
              return (
                <CanvasEmoji
                  key={item.id}
                  item={item as EmojiItem}
                  isSelected={isSelected}
                />
              );
            }
            if (item.type === 'text') {
              return (
                <CanvasText
                  key={item.id}
                  item={item as TextItem}
                  isSelected={isSelected}
                />
              );
            }
            if (item.type === 'shape') {
              return (
                <CanvasShape
                  key={item.id}
                  item={item as ShapeItem}
                  isSelected={isSelected}
                />
              );
            }
            if (item.type === 'brush') {
              return (
                <CanvasBrush
                  key={item.id}
                  item={item as BrushItem}
                  isSelected={isSelected}
                />
              );
            }
            return null;
          })}

          {isStoryMode && currentFrame && speechBubbles.map(bubble => (
            <SpeechBubble
              key={bubble.id}
              bubble={bubble}
              frameId={currentFrame.id}
            />
          ))}
          
          {renderPreview()}

          {isStoryMode && frameBorder && frameBorder.style !== 'none' && (
            <div style={buildFrameBorderStyle(frameBorder)} />
          )}
          
          {items.length === 0 && !isDrawing.current && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-6xl mb-4 animate-bounce">✨</div>
              <p className="text-lg font-medium">
                {isStoryMode ? '开始创作你的分镜内容' : '点击左侧表情或使用工具栏添加到画布'}
              </p>
              <p className="text-sm mt-2">拖拽调整位置 · 自由创作</p>
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 opacity-30 blur-xl -z-10" style={{ borderRadius: `calc(${canvasBorderRadius} + 2rem)` }} />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          画布尺寸: {canvasSize.width} × {canvasSize.height}px
          {isStoryMode && currentFrame && ` · 第 ${currentFrame.order + 1}/${frames.length} 格`}
        </p>
      </div>
    </div>
  );
}
