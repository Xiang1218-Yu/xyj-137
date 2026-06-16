import { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore, type ShapeItem } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

interface CanvasShapeProps {
  item: ShapeItem;
  isSelected: boolean;
}

export function CanvasShape({ item, isSelected }: CanvasShapeProps) {
  const shapeRef = useRef<HTMLDivElement>(null);
  const updateItem = useCanvasStore(state => state.updateItem);
  const selectItem = useCanvasStore(state => state.selectItem);
  const saveToHistory = useCanvasStore(state => state.saveToHistory);
  const removeItem = useCanvasStore(state => state.removeItem);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const dragStart = useRef({ x: 0, y: 0, itemX: 0, itemY: 0 });
  const resizeStart = useRef({ scale: 0, distance: 0 });
  const rotateStart = useRef({ angle: 0, rotation: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (item.locked) return;
    
    selectItem(item.id);
    
    const rect = shapeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };
  }, [item.id, item.x, item.y, item.locked, selectItem]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (item.locked) return;
    
    const rect = shapeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startDistance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );
    
    setIsResizing(true);
    resizeStart.current = {
      scale: item.scale,
      distance: startDistance,
    };
  }, [item.scale, item.locked]);

  const handleRotateStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (item.locked) return;
    
    const rect = shapeRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    setIsRotating(true);
    rotateStart.current = {
      angle: startAngle,
      rotation: item.rotation,
    };
  }, [item.rotation, item.locked]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        updateItem(item.id, {
          x: dragStart.current.itemX + dx,
          y: dragStart.current.itemY + dy,
        });
      }
      
      if (isResizing) {
        const rect = shapeRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentDistance = Math.sqrt(
          Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
        );
        
        const scaleRatio = currentDistance / resizeStart.current.distance;
        const newScale = Math.max(0.2, Math.min(5, resizeStart.current.scale * scaleRatio));
        updateItem(item.id, { scale: Math.round(newScale * 100) / 100 });
      }
      
      if (isRotating) {
        const rect = shapeRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        
        const delta = currentAngle - rotateStart.current.angle;
        updateItem(item.id, { rotation: rotateStart.current.rotation + delta });
      }
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing || isRotating) {
        saveToHistory();
      }
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
    };

    if (isDragging || isResizing || isRotating) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, isRotating, item.id, updateItem, saveToHistory]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected) return;
    
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      removeItem(item.id);
    }
    
    const moveAmount = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      updateItem(item.id, { y: item.y - moveAmount });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      updateItem(item.id, { y: item.y + moveAmount });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      updateItem(item.id, { x: item.x - moveAmount });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      updateItem(item.id, { x: item.x + moveAmount });
    }
  }, [isSelected, item.id, item.x, item.y, updateItem, removeItem]);

  const renderShape = () => {
    const { style, shapeType, width, height } = item;
    const baseStyle: React.CSSProperties = {
      width: width * item.scale,
      height: height * item.scale,
      opacity: style.opacity,
    };

    switch (shapeType) {
      case 'rectangle':
        return (
          <div
            style={{
              ...baseStyle,
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
              ...baseStyle,
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
              ...baseStyle,
              backgroundColor: style.fill,
              border: `${style.strokeWidth}px solid ${style.stroke}`,
              borderRadius: '50% / 50%',
            }}
          />
        );
      
      case 'triangle':
        return (
          <svg
            width={width * item.scale}
            height={height * item.scale}
            viewBox={`0 0 ${width} ${height}`}
            style={{ opacity: style.opacity }}
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
            width={width * item.scale}
            height={height * item.scale}
            viewBox={`0 0 ${width} ${height}`}
            style={{ opacity: style.opacity }}
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
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          starPoints += `${x},${y} `;
        }
        
        return (
          <svg
            width={width * item.scale}
            height={height * item.scale}
            viewBox={`0 0 ${width} ${height}`}
            style={{ opacity: style.opacity }}
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
  };

  return (
    <div
      ref={shapeRef}
      tabIndex={item.locked ? -1 : 0}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute select-none",
        item.locked ? "pointer-events-none" : "cursor-move focus:outline-none",
        isSelected && "z-50"
      )}
      style={{
        left: item.x,
        top: item.y,
        zIndex: item.zIndex,
        transform: `rotate(${item.rotation}deg)`,
      }}
    >
      <div
        className={cn(
          "transition-all duration-75",
          isDragging && "drop-shadow-2xl",
          isNew && "animate-bounce-in"
        )}
      >
        {renderShape()}
      </div>
      
      {isSelected && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg pointer-events-none animate-pulse" />
          
          <div
            className="absolute -right-3 -bottom-3 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full cursor-se-resize shadow-lg hover:scale-125 transition-transform z-10 border-2 border-white"
            onMouseDown={handleResizeStart}
          />
          
          <div
            className="absolute left-1/2 -top-8 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full cursor-grab active:cursor-grabbing shadow-lg hover:scale-125 transition-transform z-10 border-2 border-white"
            onMouseDown={handleRotateStart}
          >
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-3 bg-purple-400" />
          </div>
        </>
      )}
    </div>
  );
}
