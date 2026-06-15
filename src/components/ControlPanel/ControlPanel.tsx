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
  Sparkles,
  Image,
  Droplet,
  Grid3X3,
  Circle,
  Plus,
  Minus,
  Unlock,
} from 'lucide-react';
import { 
  useCanvasStore, 
  type CanvasItem, 
  type TextItem, 
  type EmojiItem,
  type BackgroundMode,
  type PatternType,
  SOLID_COLOR_PRESETS,
  GRADIENT_PRESETS,
  PATTERN_PRESETS,
  type BackgroundPreset,
  type GradientBackground,
} from '@/hooks/useCanvasStore';
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
  disabled?: boolean;
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
  color = 'purple',
  disabled = false,
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
          <span className={disabled ? 'text-gray-400' : ''}>{label}</span>
        </div>
        <span className={cn(
          "text-sm font-mono bg-gray-100 px-2 py-0.5 rounded-lg",
          disabled ? "text-gray-400" : "text-gray-600"
        )}>
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
        disabled={disabled}
        className={cn(
          "w-full h-2 bg-gray-200 rounded-lg appearance-none",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
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

const BACKGROUND_MODES: { key: BackgroundMode; label: string; icon: React.ReactNode }[] = [
  { key: 'solid', label: '纯色', icon: <Droplet className="w-4 h-4" /> },
  { key: 'gradient', label: '渐变', icon: <Sparkles className="w-4 h-4" /> },
  { key: 'pattern', label: '图案', icon: <Grid3X3 className="w-4 h-4" /> },
];

const PATTERN_TYPES: { key: PatternType; label: string }[] = [
  { key: 'dots', label: '圆点' },
  { key: 'grid', label: '网格' },
  { key: 'lines', label: '条纹' },
  { key: 'diagonal', label: '斜纹' },
  { key: 'waves', label: '波浪' },
  { key: 'zigzag', label: '锯齿' },
];

const GRADIENT_TYPES: { key: 'linear' | 'radial' | 'conic'; label: string }[] = [
  { key: 'linear', label: '线性' },
  { key: 'radial', label: '径向' },
  { key: 'conic', label: '锥形' },
];

function buildPresetPreview(preset: BackgroundPreset): React.CSSProperties {
  if (preset.mode === 'solid') {
    return { backgroundColor: preset.preview };
  }
  if (preset.mode === 'gradient') {
    return { background: preset.preview };
  }
  const [type, color, bgColor] = preset.preview.split(':');
  const size = 10;
  const patternColor = color;
  const backgroundColor = bgColor;
  
  let backgroundImage = '';
  let backgroundSize = `${size}px ${size}px`;
  
  switch (type) {
    case 'dot':
      backgroundImage = `radial-gradient(${patternColor} 1.5px, transparent 1.5px)`;
      break;
    case 'grid':
      backgroundImage = `linear-gradient(${patternColor}33 1px, transparent 1px), linear-gradient(90deg, ${patternColor}33 1px, transparent 1px)`;
      break;
    case 'line':
      backgroundImage = `repeating-linear-gradient(90deg, ${patternColor}33, ${patternColor}33 1px, transparent 1px, transparent ${size}px)`;
      break;
    case 'diag':
      backgroundImage = `repeating-linear-gradient(45deg, ${patternColor}33, ${patternColor}33 1px, transparent 1px, transparent ${size}px)`;
      break;
    case 'wave':
      backgroundImage = `radial-gradient(circle at 50% 0%, transparent 40%, ${patternColor}33 40%, ${patternColor}33 50%, transparent 50%), radial-gradient(circle at 50% 100%, transparent 40%, ${patternColor}33 40%, ${patternColor}33 50%, transparent 50%)`;
      backgroundSize = `${size}px ${size / 2}px`;
      break;
    case 'zig':
      backgroundImage = `linear-gradient(135deg, ${patternColor}33 25%, transparent 25%) 0 0, linear-gradient(225deg, ${patternColor}33 25%, transparent 25%) 0 0, linear-gradient(315deg, ${patternColor}33 25%, transparent 25%) 0 0, linear-gradient(45deg, ${patternColor}33 25%, transparent 25%) 0 0`;
      break;
  }
  
  return { backgroundImage, backgroundSize, backgroundColor };
}

function BackgroundPanel() {
  const { 
    background, 
    setBackgroundMode, 
    updateSolidBackground, 
    updateGradientBackground, 
    updatePatternBackground,
    applyBackgroundPreset,
  } = useCanvasStore();

  const currentOpacity = background.opacity ?? 1;
  const updateOpacity = (opacity: number) => {
    if (background.mode === 'solid') updateSolidBackground({ opacity });
    else if (background.mode === 'gradient') updateGradientBackground({ opacity });
    else if (background.mode === 'pattern') updatePatternBackground({ opacity });
  };

  const currentPresets = 
    background.mode === 'solid' ? SOLID_COLOR_PRESETS :
    background.mode === 'gradient' ? GRADIENT_PRESETS :
    PATTERN_PRESETS;

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
          🎨 画布背景
        </h3>
        
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100 rounded-xl">
          {BACKGROUND_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => setBackgroundMode(m.key)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-sm font-medium transition-all",
                background.mode === m.key
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Image className="w-4 h-4" />
            预设背景
          </h4>
          
          <div className="grid grid-cols-4 gap-2">
            {currentPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyBackgroundPreset(preset)}
                className="group relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 hover:shadow-lg"
                title={preset.name}
              >
                <div 
                  className="absolute inset-0"
                  style={buildPresetPreview(preset)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end justify-center pb-1">
                  <span className="text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {preset.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            自定义设置
          </h4>

          {background.mode === 'solid' && (
            <div className="space-y-4">
              <ColorPicker
                label="背景颜色"
                icon={<Droplet className="w-4 h-4 text-blue-500" />}
                value={background.color}
                onChange={(v) => updateSolidBackground({ color: v })}
              />
            </div>
          )}

          {background.mode === 'gradient' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span>渐变类型</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {GRADIENT_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => updateGradientBackground({ type: t.key })}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-xs font-medium transition-all",
                        background.type === t.key
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {background.type !== 'radial' && (
                <SliderControl
                  label="渐变角度"
                  icon={<RotateCw className="w-4 h-4 text-orange-500" />}
                  value={background.angle}
                  min={0}
                  max={360}
                  step={1}
                  unit="°"
                  onChange={(v) => updateGradientBackground({ angle: v })}
                  color="orange"
                />
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Palette className="w-4 h-4 text-pink-500" />
                    <span>渐变颜色</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        const colors = [...background.colors];
                        if (colors.length < 5) {
                          colors.push({ 
                            color: '#FFFFFF', 
                            stop: colors.length > 0 ? (colors[colors.length - 1].stop + 1) / 2 : 0.5 
                          });
                          updateGradientBackground({ colors });
                        }
                      }}
                      disabled={background.colors.length >= 5}
                      className="p-1 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        const colors = [...background.colors];
                        if (colors.length > 2) {
                          colors.pop();
                          updateGradientBackground({ colors });
                        }
                      }}
                      disabled={background.colors.length <= 2}
                      className="p-1 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {background.colors.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <label className="relative w-7 h-7 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors flex-shrink-0">
                        <input
                          type="color"
                          value={c.color}
                          onChange={(e) => {
                            const colors = [...background.colors];
                            colors[idx] = { ...colors[idx], color: e.target.value };
                            updateGradientBackground({ colors });
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="absolute inset-0" style={{ backgroundColor: c.color }} />
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={c.stop}
                        onChange={(e) => {
                          const colors = [...background.colors];
                          colors[idx] = { ...colors[idx], stop: Number(e.target.value) };
                          (colors as GradientBackground['colors']).sort((a, b) => a.stop - b.stop);
                          updateGradientBackground({ colors });
                        }}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                      />
                      <span className="text-xs font-mono w-10 text-right text-gray-500">
                        {Math.round(c.stop * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {background.mode === 'pattern' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Grid3X3 className="w-4 h-4 text-cyan-500" />
                  <span>图案类型</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {PATTERN_TYPES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => updatePatternBackground({ pattern: t.key })}
                      className={cn(
                        "py-1.5 px-2 rounded-lg text-xs font-medium transition-all",
                        background.pattern === t.key
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <ColorPicker
                label="图案颜色"
                icon={<Circle className="w-4 h-4 text-purple-500" />}
                value={background.color}
                onChange={(v) => updatePatternBackground({ color: v })}
              />

              <ColorPicker
                label="底色"
                icon={<Droplet className="w-4 h-4 text-pink-500" />}
                value={background.backgroundColor}
                onChange={(v) => updatePatternBackground({ backgroundColor: v })}
              />

              <SliderControl
                label="图案大小"
                icon={<Grid3X3 className="w-4 h-4 text-green-500" />}
                value={background.size}
                min={5}
                max={80}
                step={1}
                unit="px"
                onChange={(v) => updatePatternBackground({ size: v })}
                color="green"
              />
            </div>
          )}

          <SliderControl
            label="透明度"
            icon={<Droplet className="w-4 h-4 text-blue-500" />}
            value={currentOpacity}
            min={0}
            max={1}
            step={0.01}
            unit=""
            onChange={updateOpacity}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
}

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
    unlockMosaicGroup,
    removeMosaicGroup,
    findMosaicIdByItemId,
  } = useCanvasStore();

  const selectedItem = items.find(e => e.id === selectedId);

  if (!selectedItem) {
    return <BackgroundPanel />;
  }

  const mosaicId = selectedItem.mosaicId || findMosaicIdByItemId(selectedItem.id);
  const isMosaicItem = !!mosaicId;

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
              {isMosaicItem && <span className="ml-1.5 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">拼贴组</span>}
            </p>
            <p className="text-xs text-gray-500">ID: {selectedItem.id.slice(0, 6)}...</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {isMosaicItem && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              拼贴组操作
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => mosaicId && unlockMosaicGroup(mosaicId)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Unlock className="w-4 h-4" />
                解锁全组
              </button>
              <button
                onClick={() => mosaicId && removeMosaicGroup(mosaicId)}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                删除整组
              </button>
            </div>
          </div>
        )}

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
          <div className="space-y-4">
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
          </div>
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
