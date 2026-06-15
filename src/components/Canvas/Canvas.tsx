import { CanvasEmoji } from './CanvasEmoji';
import { useCanvasStore } from '@/hooks/useCanvasStore';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function Canvas({ canvasRef }: CanvasProps) {
  const { emojis, selectedId, selectEmoji, canvasSize } = useCanvasStore();

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectEmoji(null);
    }
  };

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
            background: `
              linear-gradient(135deg, #fff5f7 0%, #f5f3ff 50%, #f0f9ff 100%)
            `,
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(251, 113, 133, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #fff5f7 0%, #f5f3ff 50%, #f0f9ff 100%)
            `,
          }}
        >
          <div 
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />
          
          <div className="absolute inset-4 border-2 border-dashed border-purple-200 rounded-2xl pointer-events-none" />
          
          {emojis.map((item) => (
            <CanvasEmoji
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
            />
          ))}
          
          {emojis.length === 0 && (
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
