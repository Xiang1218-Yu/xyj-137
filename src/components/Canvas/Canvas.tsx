import { CanvasEmoji } from './CanvasEmoji';
import { CanvasText } from './CanvasText';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import type { EmojiItem, TextItem } from '@/hooks/useCanvasStore';
import { buildBackgroundStyles } from '@/utils/backgroundStyles';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function Canvas({ canvasRef }: CanvasProps) {
  const { items, selectedId, selectItem, canvasSize, background } = useCanvasStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectItem(null);
    }
  };

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  const bgStyles = buildBackgroundStyles(background);

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
            return null;
          })}
          
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
