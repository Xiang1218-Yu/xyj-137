import { 
  Move, 
  ZoomIn, 
  RotateCw, 
  Trash2, 
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowUp,
  ArrowDown,
  Layers,
  Type,
  Palette,
  Bold,
  Sparkles
} from 'lucide-react';
import { useCanvasStore, type CanvasItem, type TextItem, type EmojiItem } from '@/hooks/useCanvasStore';
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
    green: 'accent-green-500',
    orange: 'accent-orange-500',
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

interface ColorPickerProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, icon, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
          {value}
        </span>
        <label className="relative w-8 h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
  { label: 'Impact', value: 'Impact, sans-serif' },
  { label: 'Comic Sans', value: '"Comic Sans MS", cursive' },
];

export function ControlPanel() {
  const { 
    items, 
    selectedId, 
    updateItem, 
    removeItem,
    updateTextStyle,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    saveToHistory,
  } = useCanvasStore();

  const selectedItem = items.find(e => e.id === selectedId);

  if (!selectedItem) {
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
          <p className="font-medium">选择一个元素</p>
          <p className="text-sm mt-1">点击画布上的元素进行编辑</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (key: keyof CanvasItem, value: number | string) => {
    updateItem(selectedItem.id, { [key]: value } as Partial<CanvasItem>);
  };

  const isTextItem = selectedItem.type === 'text';
  const textItem = isTextItem ? (selectedItem as TextItem) : null;

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          🎛️ 属性面板
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-2xl overflow-hidden">
            {selectedItem.type === 'emoji' ? (
              (selectedItem as EmojiItem).emoji
            ) : (
              <Type className="w-6 h-6 text-purple-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {selectedItem.type === 'emoji' ? '表情元素' : '文字元素'}
            </p>
            <p className="text-xs text-gray-500">ID: {selectedItem.id.slice(0, 6)}...</p>
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
            value={selectedItem.x}
            min={-200}
            max={600}
            step={1}
            unit="px"
            onChange={(v) => handleUpdate('x', v)}
            onChangeEnd={saveToHistory}
            color="purple"
          />
          <SliderControl
            label="Y 坐标"
            icon={<Move className="w-4 h-4 text-pink-500" />}
            value={selectedItem.y}
            min={-200}
            max={600}
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
            value={selectedItem.scale}
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
            value={selectedItem.rotation}
            min={-180}
            max={180}
            step={1}
            unit="°"
            onChange={(v) => handleUpdate('rotation', v)}
            onChangeEnd={saveToHistory}
            color="blue"
          />
        </div>

        {isTextItem && textItem && (
          <>
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Type className="w-4 h-4" />
                文字样式
              </h4>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Type className="w-4 h-4 text-green-500" />
                  <span>字体</span>
                </div>
                <select
                  value={textItem.style.fontFamily}
                  onChange={(e) => {
                    updateTextStyle(selectedItem.id, { fontFamily: e.target.value });
                    saveToHistory();
                  }}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                >
                  {FONT_OPTIONS.map(font => (
                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <SliderControl
                label="字体大小"
                icon={<Bold className="w-4 h-4 text-green-500" />}
                value={textItem.style.fontSize}
                min={12}
                max={120}
                step={1}
                unit="px"
                onChange={(v) => updateTextStyle(selectedItem.id, { fontSize: v })}
                onChangeEnd={saveToHistory}
                color="green"
              />

              <ColorPicker
                label="文字颜色"
                icon={<Palette className="w-4 h-4 text-purple-500" />}
                value={textItem.style.color}
                onChange={(v) => {
                  updateTextStyle(selectedItem.id, { color: v });
                  saveToHistory();
                }}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Bold className="w-4 h-4" />
                描边
              </h4>
              
              <SliderControl
                label="描边粗细"
                icon={<Bold className="w-4 h-4 text-orange-500" />}
                value={textItem.style.strokeWidth}
                min={0}
                max={10}
                step={0.5}
                unit="px"
                onChange={(v) => updateTextStyle(selectedItem.id, { strokeWidth: v })}
                onChangeEnd={saveToHistory}
                color="orange"
              />

              <ColorPicker
                label="描边颜色"
                icon={<Palette className="w-4 h-4 text-orange-500" />}
                value={textItem.style.strokeColor}
                onChange={(v) => {
                  updateTextStyle(selectedItem.id, { strokeColor: v });
                  saveToHistory();
                }}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                阴影
              </h4>
              
              <SliderControl
                label="阴影模糊"
                icon={<Sparkles className="w-4 h-4 text-blue-500" />}
                value={textItem.style.shadowBlur}
                min={0}
                max={30}
                step={1}
                unit="px"
                onChange={(v) => updateTextStyle(selectedItem.id, { shadowBlur: v })}
                onChangeEnd={saveToHistory}
                color="blue"
              />

              <SliderControl
                label="阴影水平偏移"
                icon={<Move className="w-4 h-4 text-blue-500" />}
                value={textItem.style.shadowOffsetX}
                min={-20}
                max={20}
                step={1}
                unit="px"
                onChange={(v) => updateTextStyle(selectedItem.id, { shadowOffsetX: v })}
                onChangeEnd={saveToHistory}
                color="blue"
              />

              <SliderControl
                label="阴影垂直偏移"
                icon={<Move className="w-4 h-4 text-blue-500" />}
                value={textItem.style.shadowOffsetY}
                min={-20}
                max={20}
                step={1}
                unit="px"
                onChange={(v) => updateTextStyle(selectedItem.id, { shadowOffsetY: v })}
                onChangeEnd={saveToHistory}
                color="blue"
              />

              <ColorPicker
                label="阴影颜色"
                icon={<Palette className="w-4 h-4 text-gray-500" />}
                value={textItem.style.shadowColor}
                onChange={(v) => {
                  updateTextStyle(selectedItem.id, { shadowColor: v });
                  saveToHistory();
                }}
              />
            </div>
          </>
        )}

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            图层顺序
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => bringToFront(selectedItem.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowUpToLine className="w-4 h-4" />
              置顶
            </button>
            <button
              onClick={() => sendToBack(selectedItem.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowDownToLine className="w-4 h-4" />
              置底
            </button>
            <button
              onClick={() => bringForward(selectedItem.id)}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm font-medium hover:bg-purple-200 hover:scale-105 active:scale-95 transition-all"
            >
              <ArrowUp className="w-4 h-4" />
              上移
            </button>
            <button
              onClick={() => sendBackward(selectedItem.id)}
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
          onClick={() => removeItem(selectedItem.id)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-400 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Trash2 className="w-5 h-5" />
          删除元素
        </button>
      </div>
    </div>
  );
}
