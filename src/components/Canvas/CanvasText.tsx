import { useRef, useState, useEffect, useCallback } from 'react';
import { useCanvasStore, type TextItem } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

interface CanvasTextProps {
  item: TextItem;
  isSelected: boolean;
}

export function CanvasText({ item, isSelected }: CanvasTextProps) {
  const textRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateItem = useCanvasStore(state => state.updateItem);
  const selectItem = useCanvasStore(state => state.selectItem);
  const saveToHistory = useCanvasStore(state => state.saveToHistory);
  const removeItem = useCanvasStore(state => state.removeItem);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [editText, setEditText] = useState(item.text);
  const dragStart = useRef({ x: 0, y: 0, itemX: 0, itemY: 0 });
  const resizeStart = useRef({ scale: 0, distance: 0 });
  const rotateStart = useRef({ angle: 0, rotation: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    
    if (item.locked) return;
    
    selectItem(item.id);
    
    const rect = textRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };
  }, [item.id, item.x, item.y, item.locked, selectItem, isEditing]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.locked) return;
    setIsEditing(true);
    setEditText(item.text);
  }, [item.text, item.locked]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (item.locked) return;
    
    const rect = textRef.current?.getBoundingClientRect();
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
    
    const rect = textRef.current?.getBoundingClientRect();
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
        const rect = textRef.current?.getBoundingClientRect();
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
        const rect = textRef.current?.getBoundingClientRect();
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

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const finishEditing = useCallback(() => {
    setIsEditing(false);
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      updateItem(item.id, { text: trimmed });
      saveToHistory();
    } else if (!trimmed) {
      setEditText(item.text);
    }
  }, [editText, item.id, item.text, updateItem, saveToHistory]);

  const handleInputBlur = useCallback(() => {
    finishEditing();
  }, [finishEditing]);

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
    if (e.key === 'Escape') {
      setEditText(item.text);
      setIsEditing(false);
    }
  }, [finishEditing, item.text]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isSelected || isEditing) return;
    
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
  }, [isSelected, isEditing, item.id, item.x, item.y, updateItem, removeItem]);

  const { style } = item;
  const fontSize = style.fontSize * item.scale;

  const textShadow = style.shadowBlur > 0 || style.shadowOffsetX !== 0 || style.shadowOffsetY !== 0
    ? `${style.shadowOffsetX}px ${style.shadowOffsetY}px ${style.shadowBlur}px ${style.shadowColor}`
    : 'none';

  return (
    <div
      ref={textRef}
      tabIndex={item.locked ? -1 : 0}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
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
          "whitespace-nowrap font-bold transition-all duration-75",
          isDragging && "drop-shadow-2xl",
          isNew && "animate-bounce-in"
        )}
        style={{
          fontFamily: style.fontFamily,
          fontSize,
          color: style.color,
          textShadow,
          WebkitTextStroke: style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : 'none',
          paintOrder: 'stroke fill',
          lineHeight: 1.2,
        }}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="bg-transparent border-none outline-none font-bold"
            style={{
              fontFamily: style.fontFamily,
              fontSize,
              color: style.color,
              textShadow,
              WebkitTextStroke: style.strokeWidth > 0 ? `${style.strokeWidth}px ${style.strokeColor}` : 'none',
              paintOrder: 'stroke fill',
              lineHeight: 1.2,
              width: 'auto',
              minWidth: '1em',
            }}
          />
        ) : (
          item.text
        )}
      </div>
      
      {isSelected && !isEditing && (
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
