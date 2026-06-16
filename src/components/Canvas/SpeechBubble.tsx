import { useState } from 'react';
import type { SpeechBubble as SpeechBubbleType } from '@/hooks/useCanvasStore';
import { useCanvasStore } from '@/hooks/useCanvasStore';

interface SpeechBubbleProps {
  bubble: SpeechBubbleType;
  frameId: string;
}

export function SpeechBubble({ bubble, frameId }: SpeechBubbleProps) {
  const { updateSpeechBubble } = useCanvasStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX - bubble.x, y: e.clientY - bubble.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    e.stopPropagation();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    updateSpeechBubble(frameId, bubble.id, { x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStart(null);
  };

  const getBubbleStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: bubble.x,
      top: bubble.y,
      width: bubble.width,
      minHeight: 40,
      backgroundColor: bubble.backgroundColor,
      color: bubble.textColor,
      fontSize: bubble.fontSize,
      fontFamily: 'Arial, sans-serif',
      padding: '10px 16px',
      border: `2px solid ${bubble.borderColor}`,
      zIndex: 9998,
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      boxSizing: 'border-box',
    };

    switch (bubble.style) {
      case 'round':
        return {
          ...baseStyle,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px',
        };
      case 'speech':
        return {
          ...baseStyle,
          borderRadius: '16px',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
        };
      case 'thought':
        return {
          ...baseStyle,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px',
          borderStyle: 'dashed',
        };
      case 'shout':
        return {
          ...baseStyle,
          borderRadius: '8px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          transform: 'rotate(-1deg)',
          boxShadow: `3px 3px 0 ${bubble.borderColor}`,
        };
      case 'whisper':
        return {
          ...baseStyle,
          borderRadius: '20px',
          fontStyle: 'italic',
          opacity: 0.85,
          borderStyle: 'dotted',
        };
      default:
        return {
          ...baseStyle,
          borderRadius: '12px',
        };
    }
  };

  const renderTail = () => {
    if (bubble.style === 'round' || bubble.style === 'thought') {
      const circles = bubble.style === 'thought' ? 3 : 0;
      if (circles === 0) return null;
      
      const tailStyle: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
      };

      let positionedStyle: React.CSSProperties;
      switch (bubble.tailPosition) {
        case 'bottom':
          positionedStyle = { ...tailStyle, bottom: '-16px', left: '20px', flexDirection: 'row' };
          break;
        case 'top':
          positionedStyle = { ...tailStyle, top: '-16px', left: '20px', flexDirection: 'row-reverse' };
          break;
        case 'left':
          positionedStyle = { ...tailStyle, left: '-16px', top: '20px', flexDirection: 'column' };
          break;
        case 'right':
          positionedStyle = { ...tailStyle, right: '-16px', top: '20px', flexDirection: 'column-reverse' };
          break;
      }

      return (
        <div style={positionedStyle}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                width: 8 - i * 2,
                height: 8 - i * 2,
                borderRadius: '50%',
                backgroundColor: bubble.backgroundColor,
                border: `2px solid ${bubble.borderColor}`,
              }}
            />
          ))}
        </div>
      );
    }

    if (bubble.style === 'speech' || bubble.style === 'shout' || bubble.style === 'whisper') {
      const tailSize = 14;
      const tailStyle: React.CSSProperties = {
        position: 'absolute',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      };

      let positionedStyle: React.CSSProperties;
      switch (bubble.tailPosition) {
        case 'bottom':
          positionedStyle = {
            ...tailStyle,
            bottom: -tailSize + 2,
            left: '24px',
            borderWidth: `${tailSize}px ${tailSize / 2}px 0 ${tailSize / 2}px`,
            borderColor: `${bubble.borderColor} transparent transparent transparent`,
          };
          break;
        case 'top':
          positionedStyle = {
            ...tailStyle,
            top: -tailSize + 2,
            left: '24px',
            borderWidth: `0 ${tailSize / 2}px ${tailSize}px ${tailSize / 2}px`,
            borderColor: `transparent transparent ${bubble.borderColor} transparent`,
          };
          break;
        case 'left':
          positionedStyle = {
            ...tailStyle,
            left: -tailSize + 2,
            top: '20px',
            borderWidth: `${tailSize / 2}px ${tailSize}px ${tailSize / 2}px 0`,
            borderColor: `transparent ${bubble.borderColor} transparent transparent`,
          };
          break;
        case 'right':
          positionedStyle = {
            ...tailStyle,
            right: -tailSize + 2,
            top: '20px',
            borderWidth: `${tailSize / 2}px 0 ${tailSize / 2}px ${tailSize}px`,
            borderColor: `transparent transparent transparent ${bubble.borderColor}`,
          };
          break;
      }

      return <div style={positionedStyle} />;
    }

    return null;
  };

  return (
    <div
      style={getBubbleStyles()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
    >
      {renderTail()}
      {isEditing ? (
        <textarea
          autoFocus
          value={bubble.text}
          onChange={(e) => updateSpeechBubble(frameId, bubble.id, { text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            height: '100%',
            minHeight: 30,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: bubble.textColor,
            fontSize: bubble.fontSize,
            fontFamily: 'inherit',
            resize: 'none',
            textAlign: bubble.style === 'round' || bubble.style === 'thought' ? 'center' : 'left',
          }}
        />
      ) : (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {bubble.text}
        </div>
      )}
    </div>
  );
}
