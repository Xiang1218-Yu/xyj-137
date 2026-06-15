import { useEffect, useRef } from 'react';
import { CanvasEmoji } from './CanvasEmoji';
import { CanvasText } from './CanvasText';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import type { EmojiItem, TextItem, CanvasBackground, PatternBackground, GradientBackground, CanvasItem } from '@/hooks/useCanvasStore';
import { calculateFrameTransform } from '@/utils/animationUtils';

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
  } else {
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
  }
}

export function Canvas({ canvasRef }: CanvasProps) {
  const { items, selectedId, selectItem, canvasSize, background, animationSettings, setCurrentFrame } = useCanvasStore();
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectItem(null);
    }
  };

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  const bgStyles = buildBackgroundStyles(background);

  const { isPlaying, frameCount, frameDelay, currentFrame } = animationSettings;

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= frameDelay) {
        lastUpdateRef.current = timestamp;
        setCurrentFrame((currentFrame + 1) % frameCount);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, frameCount, frameDelay, currentFrame, setCurrentFrame]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative p-8">
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="relative overflow-hidden rounded-3xl shadow-2xl cursor-crosshair"
          style={{
            width: canvasSize.width,
            height: canvasSize.height,
            ...bgStyles,
          }}
        >
          <div className="absolute inset-4 border-2 border-dashed border-purple-200/50 rounded-2xl pointer-events-none" />
          
          {isPlaying ? (
            sortedItems.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <AnimatedCanvasItem
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  frameIndex={currentFrame}
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
              return null;
            })
          )}
          
          {items.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <div className="text-6xl mb-4 animate-bounce">✨</div>
              <p className="text-lg font-medium">点击左侧表情添加到画布</p>
              <p className="text-sm mt-2">拖拽调整位置 · 自由创作</p>
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
