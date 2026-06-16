import { useEffect, useRef, useState, useCallback } from 'react';
import { CanvasEmoji } from './CanvasEmoji';
import { CanvasText } from './CanvasText';
import { CanvasShape } from './CanvasShape';
import { CanvasBrush } from './CanvasBrush';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import type { EmojiItem, TextItem, ShapeItem, BrushItem, CanvasBackground, PatternBackground, GradientBackground, CanvasItem, BrushPoint, ShapeType } from '@/hooks/useCanvasStore';
import { calculateFrameTransform } from '@/utils/animationUtils';
import { cn } from '@/lib/utils';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

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

export function buildBackgroundStyles(bg: CanvasBackground): React.CSSProperties {
  const opacity = bg.opacity ?? 1;

  if (bg.mode === 'solid') {
    return {
      backgroundColor: hexToRgba(bg.color, opacity),
    };
  }

  if (bg.mode === 'gradient') {
    const gradient = buildGradientCSS(bg);
    if (opacity >= 1) {
      return {
        background: gradient,
      };
    }
    return {
      backgroundImage: `linear-gradient(to right, rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity})), ${gradient}`,
    };
  }

  if (bg.mode === 'pattern') {
    const pattern = buildPatternCSS(bg);
    if (opacity >= 1) {
      return {
        backgroundImage: pattern.backgroundImage,
        backgroundSize: pattern.backgroundSize,
        backgroundColor: pattern.backgroundColor,
      };
    }
    return {
      backgroundImage: `linear-gradient(to right, rgba(255,255,255,${1 - opacity}), rgba(255,255,255,${1 - opacity})), ${pattern.backgroundImage}`,
      backgroundSize: `${pattern.backgroundSize}, ${pattern.backgroundSize}`,
      backgroundColor: pattern.backgroundColor,
    };
  }

  return {};
}

interface AnimatedCanvasItemProps {
  item: CanvasItem;
  isSelected: boolean;
  frameIndex: number;
  totalFrames: number;
  isAnimating: boolean;
}

function AnimatedCanvasItem({ item, isSelected, frameIndex, totalFrames, isAnimating }: AnimatedCanvasItemProps) {
  const transform = isAnimating && item.animation
    ? calculateFrameTransform(item, frameIndex, totalFrames)
    : { x: item.x, y: item.y, scale: item.scale, rotation: item.rotation, opacity: 1 };

  const commonStyle: React.CSSProperties = {
    position: 'absolute',
    left: transform.x,
    top: transform.y,
    zIndex: item.zIndex,
    transform: `rotate(${transform.rotation}deg) scale(${transform.scale})`,
    transformOrigin: 'center center',
    opacity: transform.opacity,
    transition: isAnimating ? 'none' : undefined,
  };

  if (item.type === 'emoji') {
    const emojiItem = item as EmojiItem;
    const size = 80;
    return (
      <div style={{ ...commonStyle, width: size, height: size }}>
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.8,
          lineHeight: 1,
        }}>
          {emojiItem.emoji}
        </div>
        {isSelected && (
          <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
    );
  } else if (item.type === 'text') {
    const textItem = item as TextItem;
    const { style } = textItem;
    const fontSize = style.fontSize;
    const textShadow = style.shadowBlur > 0 || style.shadowOffsetX !== 0 || style.shadowOffsetY !== 0
      ? `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`
      : 'none';

    return (
      <div style={commonStyle}>
        <div style={{
          fontFamily: style.fontFamily,
          fontSize,
          color: style.color,
          textShadow,
          WebkitTextStroke: style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : 'none',
          paintOrder: 'stroke fill',
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          fontWeight: 'bold',
        }}>
          {textItem.text}
        </div>
        {isSelected && (
          <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
    );
  } else if (item.type === 'shape') {
    const shapeItem = item as ShapeItem;
    const { style, shapeType, width, height } = shapeItem;

    const renderShape = () => {
      switch (shapeType) {
        case 'rectangle':
          return (
            <div style={{
              width: width * transform.scale,
              height: height * transform.scale,
              backgroundColor: style.fill,
              border: `${style.strokeWidth}px solid ${style.stroke}`,
              borderRadius: style.borderRadius,
              opacity: style.opacity,
            }} />
          );
        case 'circle':
          return (
            <div style={{
              width: width * transform.scale,
              height: height * transform.scale,
              backgroundColor: style.fill,
              border: `${style.strokeWidth}px solid ${style.stroke}`,
              borderRadius: '50%',
              opacity: style.opacity,
            }} />
          );
        case 'ellipse':
          return (
            <div style={{
              width: width * transform.scale,
              height: height * transform.scale,
              backgroundColor: style.fill,
              border: `${style.strokeWidth}px solid ${style.stroke}`,
              borderRadius: '50% / 50%',
              opacity: style.opacity,
            }} />
          );
        case 'triangle':
          return (
            <svg width={width * transform.scale} height={height * transform.scale} viewBox={`0 0 ${width} ${height}`} style={{ opacity: style.opacity }}>
              <polygon points={`${width / 2},0 ${width},${height} 0,${height}`} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
            </svg>
          );
        case 'line':
          return (
            <svg width={width * transform.scale} height={height * transform.scale} viewBox={`0 0 ${width} ${height}`} style={{ opacity: style.opacity }}>
              <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={style.stroke} strokeWidth={style.strokeWidth || 2} strokeLinecap="round" />
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
            <svg width={width * transform.scale} height={height * transform.scale} viewBox={`0 0 ${width} ${height}`} style={{ opacity: style.opacity }}>
              <polygon points={starPoints.trim()} fill={style.fill} stroke={style.stroke} strokeWidth={style.strokeWidth} />
            </svg>
          );
        }
        default:
          return null;
      }
    };

    return (
      <div style={commonStyle}>
        {renderShape()}
        {isSelected && (
          <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
    );
  } else if (item.type === 'brush') {
    const brushItem = item as BrushItem;
    const { points, style } = brushItem;

    const getPathData = () => {
      if (points.length < 2) return '';
      const smoothness = style.smoothness || 0.5;
      let path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        if (smoothness > 0 && i < points.length - 1) {
          const next = points[i + 1];
          const cpx = curr.x + (next.x - prev.x) * smoothness * 0.5;
          const cpy = curr.y + (next.y - prev.y) * smoothness * 0.5;
          path += ` Q ${curr.x} ${curr.y} ${cpx} ${cpy}`;
        } else {
          path += ` L ${curr.x} ${curr.y}`;
        }
      }
      return path;
    };

    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const boundsWidth = Math.max(...xs) - Math.min(...xs) + style.strokeWidth * 2;
    const boundsHeight = Math.max(...ys) - Math.min(...ys) + style.strokeWidth * 2;
    const pathData = getPathData();

    return (
      <div style={commonStyle}>
        <svg width={boundsWidth * transform.scale} height={boundsHeight * transform.scale} style={{ overflow: 'visible', opacity: style.opacity }}>
          <path
            d={pathData}
            fill="none"
            stroke={style.color}
            strokeWidth={style.strokeWidth * transform.scale}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isSelected && (
          <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none animate-pulse" />
        )}
      </div>
    );
  }

  return null;
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
  } = useCanvasStore();
  
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(0);
  const frameCountRef = useRef<number>(30);
  const frameDelayRef = useRef<number>(50);
  const isPlayingRef = useRef<boolean>(false);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawEnd, setDrawEnd] = useState<{ x: number; y: number } | null>(null);
  const [brushPoints, setBrushPoints] = useState<BrushPoint[]>([]);
  const drawStartRef = useRef<{ x: number; y: number } | null>(null);
  const drawEndRef = useRef<{ x: number; y: number } | null>(null);
  const brushPointsRef = useRef<BrushPoint[]>([]);

  const isShapeTool = ['rectangle', 'circle', 'ellipse', 'triangle', 'star', 'line'].includes(currentTool);
  const isBrushTool = currentTool === 'brush';
  const isDrawingTool = isShapeTool || isBrushTool;

  const getCanvasCoordinates = useCallback((e: React.MouseEvent | MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [canvasRef]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDrawingTool) {
      if (e.target === e.currentTarget) {
        selectItem(null);
      }
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    
    const coords = getCanvasCoordinates(e);
    drawStartRef.current = coords;
    drawEndRef.current = coords;
    setDrawStart(coords);
    setDrawEnd(coords);
    setIsDrawing(true);

    if (isBrushTool) {
      const initialPoints = [{ x: coords.x, y: coords.y, pressure: 1 }];
      brushPointsRef.current = initialPoints;
      setBrushPoints(initialPoints);
    }
  }, [isDrawingTool, isBrushTool, selectItem, getCanvasCoordinates]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;

    const coords = getCanvasCoordinates(e);
    drawEndRef.current = coords;
    setDrawEnd(coords);

    if (isBrushTool) {
      const newPoints = [...brushPointsRef.current, { x: coords.x, y: coords.y, pressure: 1 }];
      brushPointsRef.current = newPoints;
      setBrushPoints(newPoints);
    }
  }, [isDrawing, isBrushTool, getCanvasCoordinates]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !drawStartRef.current || !drawEndRef.current) {
      setIsDrawing(false);
      setDrawStart(null);
      setDrawEnd(null);
      setBrushPoints([]);
      return;
    }

    const start = drawStartRef.current;
    const end = drawEndRef.current;

    if (isShapeTool) {
      const x = Math.min(start.x, end.x);
      const y = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      if (width > 5 || height > 5) {
        addShape(currentTool as ShapeType, x, y, width, height);
      }
    } else if (isBrushTool && brushPointsRef.current.length > 1) {
      addBrush(brushPointsRef.current);
    }

    setIsDrawing(false);
    drawStartRef.current = null;
    drawEndRef.current = null;
    brushPointsRef.current = [];
    setDrawStart(null);
    setDrawEnd(null);
    setBrushPoints([]);
    setCurrentTool('select');
  }, [isDrawing, isShapeTool, isBrushTool, currentTool, addShape, addBrush, setCurrentTool]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDrawing) {
        handleMouseUp();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDrawing, handleMouseUp]);

  const renderPreview = () => {
    if (!isDrawing || !drawStart || !drawEnd) return null;

    const start = drawStart;
    const end = drawEnd;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    if (isBrushTool && brushPoints.length > 1) {
      const points = brushPoints;
      let pathData = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathData += ` L ${points[i].x} ${points[i].y}`;
      }

      return (
        <svg
          className="absolute inset-0 pointer-events-none z-40"
          style={{ overflow: 'visible' }}
        >
          <path
            d={pathData}
            fill="none"
            stroke={brushStyle.color}
            strokeWidth={brushStyle.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={brushStyle.opacity * 0.8}
          />
        </svg>
      );
    }

    if (isShapeTool) {
      const shapeType = currentTool as ShapeType;
      const style = shapeStyle;

      const commonStyle: React.CSSProperties = {
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        opacity: style.opacity * 0.8,
        pointerEvents: 'none',
        zIndex: 40,
      };

      switch (shapeType) {
        case 'rectangle':
          return (
            <div
              style={{
                ...commonStyle,
                backgroundColor: style.fill,
                border: `${style.strokeWidth}px solid ${style.stroke}`,
                borderRadius: style.borderRadius,
              }}
            />
          );
        case 'circle':
          return (
            <div
              style={{
                ...commonStyle,
                backgroundColor: style.fill,
                border: `${style.strokeWidth}px solid ${style.stroke}`,
                borderRadius: '50%',
              }}
            />
          );
        case 'ellipse':
          return (
            <div
              style={{
                ...commonStyle,
                backgroundColor: style.fill,
                border: `${style.strokeWidth}px solid ${style.stroke}`,
                borderRadius: '50% / 50%',
              }}
            />
          );
        case 'triangle':
          return (
            <svg
              style={commonStyle}
              viewBox={`0 0 ${width} ${height}`}
            >
              <polygon
                points={`${width / 2},0 ${width},${height} 0,${height}`}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
              />
            </svg>
          );
        case 'line':
          return (
            <svg
              style={commonStyle}
              viewBox={`0 0 ${width} ${height}`}
            >
              <line
                x1="0"
                y1={height / 2}
                x2={width}
                y2={height / 2}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth || 2}
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
              style={commonStyle}
              viewBox={`0 0 ${width} ${height}`}
            >
              <polygon
                points={starPoints.trim()}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
              />
            </svg>
          );
        }
        default:
          return null;
      }
    }

    return null;
  };

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  const bgStyles = buildBackgroundStyles(background);

  const { isPlaying, frameCount, frameDelay, currentFrame } = animationSettings;
  const hasAnyAnimation = items.some(item => item.animation && item.animation.preset !== 'none');
  const showAnimated = hasAnyAnimation;

  useEffect(() => {
    frameCountRef.current = frameCount;
  }, [frameCount]);

  useEffect(() => {
    frameDelayRef.current = frameDelay;
  }, [frameDelay]);

  useEffect(() => {
    if (!isPlaying) {
      currentFrameRef.current = currentFrame;
    }
  }, [currentFrame, isPlaying]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;

    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastUpdateRef.current = 0;

    const animate = (timestamp: number) => {
      if (!isPlayingRef.current) return;

      if (timestamp - lastUpdateRef.current >= frameDelayRef.current) {
        lastUpdateRef.current = timestamp;
        currentFrameRef.current = (currentFrameRef.current + 1) % frameCountRef.current;
        setCurrentFrame(currentFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, setCurrentFrame]);

  const displayFrame = isPlaying ? currentFrameRef.current : currentFrame;

  const cursorStyle = isShapeTool 
    ? 'cursor-crosshair' 
    : isBrushTool 
      ? 'cursor-cell' 
      : 'cursor-default';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative p-8">
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          className={cn(
            "relative overflow-hidden rounded-3xl shadow-2xl",
            cursorStyle
          )}
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            ...bgStyles,
          }}
        >
          <div className="absolute inset-4 border-2 border-dashed border-purple-200/50 rounded-2xl pointer-events-none" />
          
          {showAnimated ? (
            sortedItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <AnimatedCanvasItem
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  frameIndex={displayFrame}
                  totalFrames={frameCount}
                  isAnimating={isPlaying}
                />
              );
            })
          ) : (
            sortedItems.map((item) => {
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
            })
          )}
          
          {renderPreview()}
          
          {items.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-6xl mb-4 animate-bounce">✨</div>
              <p className="text-lg font-medium">点击左侧工具栏选择工具</p>
              <p className="text-sm mt-2">绘制形状 · 自由画笔 · 创意无限</p>
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-[3rem] opacity-30 blur-xl -z-10" />
      </div>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          画布尺寸: {canvasSize.width} × {canvasSize.height}px
        </p>
      </div>
    </div>
  );
}
