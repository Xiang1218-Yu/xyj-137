import { 
  Move, 
  ZoomIn, 
  RotateCw, 
  Trash2, 
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

interface SliderControlProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  onChangeEnd?: () => void;
  color?: string;
}

function SliderControl({ 
  label, 
  icon, 
  value, 
  min, 
  max, 
  step = 1, 
  unit = '', 
  onChange,
  onChangeEnd,
  color = 'purple'
}: SliderControlProps) {
  const colorClasses: Record<string, string> = {
    purple: 'accent-purple-500',
    pink: 'accent-pink-500',
    yellow: 'accent-yellow-500',
    blue: 'accent-blue-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {icon}
          <span>{label}</span>
        </div>
        <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
          {Math.round(value * 10) / 10}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onMouseUp={onChangeEnd}
        onTouchEnd={onChangeEnd}
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
          colorClasses[color]
        )}
      />
    </div>
  );
}

export function ControlPanel() {
  const { 
    emojis, 
    selectedId, 
    updateEmoji, 
    removeEmoji,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    saveToHistory,
  } = useCanvasStore();

  const selectedEmoji = emojis.find(e => e.id === selectedId);

  if (!selectedEmoji) {
    return (
      <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            🎛️ 属性面板
          </h3>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Layers className="w-8 h-8 text-gray-300" />
          </div>
          <p className="font-medium">选择一个表情</p>
          <p className="text-sm mt-1">点击画布上的表情进行编辑</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (key: keyof typeof selectedEmoji, value: number) => {
    updateEmoji(selectedEmoji.id, { [key]: value } as Partial<typeof selectedEmoji>);
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          🎛️ 属性面板
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-3xl">
            {selectedEmoji.emoji}
          </div>
          <div>
            <p className="font-medium text-gray-800">当前选中</p>
            <p className="text-xs text-gray-500">ID: {selectedEmoji.id.slice(0, 6)}...</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Move className="w-4 h-4" />
            位置
          </h4>
          <SliderControl
            label="X 坐标"
            icon={<Move className="w-4 h-4 text-purple-500" />}
            value={selectedEmoji.x}
            min={-100}
            max={500}
            step={1}
            unit="px"
            onChange={(v) => handleUpdate('x', v)}
            onChangeEnd={saveToHistory}
            color="purple"
          />
          <SliderControl
            label="Y 坐标"
            icon={<Move className="w-4 h-4 text-pink-500" />}
            value={selectedEmoji.y}
            min={-100}
            max={500}
            step={1}
            unit="px"
            onChange={(v) => handleUpdate('y', v)}
            onChangeEnd={saveToHistory}
            color="pink"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <ZoomIn className="w-4 h-4" />
            大小与旋转
          </h4>
          <SliderControl
            label="缩放比例"
            icon={<ZoomIn className="w-4 h-4 text-yellow-500" />}
            value={selectedEmoji.scale}
            min={0.2}
            max={5}
            step={0.05}
            unit="x"
            onChange={(v) => handleUpdate('scale', v)}
            onChangeEnd={saveToHistory}
            color="yellow"
          />
          <SliderControl
            label="旋转角度"
            icon={<RotateCw className="w-4 h-4 text-blue-500" />}
            value={selectedEmoji.rotation}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => handleUpdate('rotation', v)}
            onChangeEnd={saveToHistory}
            color="blue"
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            图层顺序
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => bringToFront(selectedEmoji.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowUpToLine className="w-4 h-4" />
              置顶
            </button>
            <button
              onClick={() => sendToBack(selectedEmoji.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              置底
            </button>
            <button
              onClick={() => bringForward(selectedEmoji.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowUp className="w-4 h-4" />
              上移
            </button>
            <button
              onClick={() => sendBackward(selectedEmoji.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowDown className="w-4 h-4" />
              下移
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => removeEmoji(selectedEmoji.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Trash2 className="w-5 h-5" />
          删除表情
        </button>
      </div>
    </div>
  );
}
