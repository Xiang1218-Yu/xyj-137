import { useState, useMemo, useCallback } from 'react';
import { Sparkles, Grid3X3, Shuffle, Palette, ZoomIn, Trash2, Unlock, RefreshCcw, Lock, X } from 'lucide-react';
import { SHAPE_TEMPLATES, type ShapeType } from '@/utils/shapeTemplates';
import { COLOR_CATEGORIES, type ColorCategory, type MosaicStyle, estimateEmojiCount } from '@/utils/mosaicGenerator';
import { useCanvasStore, type EmojiItem } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

const MOSAIC_STYLES: { key: MosaicStyle; label: string; icon: React.ReactNode; description: string }[] = [
  { key: 'pixel', label: '像素风', icon: <Grid3X3 className="w-4 h-4" />, description: '整齐排列的像素风格' },
  { key: 'mosaic', label: '马赛克', icon: <Palette className="w-4 h-4" />, description: '边缘与核心差异化' },
  { key: 'random', label: '随机拼贴', icon: <Shuffle className="w-4 h-4" />, description: '大小位置随机变化' },
];

const CELL_SIZE_PRESETS = [
  { label: '超大', value: 50 },
  { label: '大', value: 35 },
  { label: '中', value: 25 },
  { label: '小', value: 18 },
  { label: '极小', value: 12 },
];

export interface MosaicControlsProps {
  onGenerate?: () => void;
}

export function MosaicControls({ onGenerate }: MosaicControlsProps) {
  const { 
    generateMosaic, 
    canvasSize, 
    unlockMosaicGroup, 
    removeMosaicGroup,
    removeItem,
    selectedId,
    findMosaicIdByItemId,
    items,
  } = useCanvasStore();
  const [selectedShape, setSelectedShape] = useState<ShapeType>('heart');
  const [selectedColor, setSelectedColor] = useState<ColorCategory>('rainbow');
  const [selectedStyle, setSelectedStyle] = useState<MosaicStyle>('pixel');
  const [cellSize, setCellSize] = useState(25);
  const [emojiScale, setEmojiScale] = useState(0.9);
  const [rotationVariation, setRotationVariation] = useState(0);
  const [offsetVariation, setOffsetVariation] = useState(0);
  const [clearBeforeGenerate, setClearBeforeGenerate] = useState(false);
  const [lockAfterGenerate, setLockAfterGenerate] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastMosaicId, setLastMosaicId] = useState<string | null>(null);
  const [showItemList, setShowItemList] = useState(false);

  const activeMosaicId = useMemo(() => {
    if (lastMosaicId && items.some(e => e.mosaicId === lastMosaicId)) {
      return lastMosaicId;
    }
    if (selectedId) {
      return findMosaicIdByItemId(selectedId);
    }
    return null;
  }, [lastMosaicId, selectedId, items, findMosaicIdByItemId]);

  const mosaicItems = useMemo(() => {
    if (!activeMosaicId) return [];
    return items.filter(e => e.mosaicId === activeMosaicId);
  }, [activeMosaicId, items]);

  const hasLockedItems = useMemo(() => {
    if (!activeMosaicId) return false;
    return items.some(e => e.mosaicId === activeMosaicId && e.locked);
  }, [activeMosaicId, items]);

  const estimatedCount = useMemo(() => {
    return estimateEmojiCount(selectedShape, cellSize, canvasSize.width, canvasSize.height);
  }, [selectedShape, cellSize, canvasSize]);

  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const newMosaicId = generateMosaic({
        shape: selectedShape,
        colorCategory: selectedColor,
        cellSize,
        style: selectedStyle,
        emojiScale,
        rotationVariation,
        offsetVariation,
        locked: lockAfterGenerate,
        clearBeforeGenerate,
      });
      setLastMosaicId(newMosaicId);
      setIsGenerating(false);
      onGenerate?.();
    }, 50);
  }, [selectedShape, selectedColor, cellSize, selectedStyle, emojiScale, rotationVariation, offsetVariation, lockAfterGenerate, clearBeforeGenerate, generateMosaic, onGenerate]);

  const handleUnlock = useCallback(() => {
    if (activeMosaicId) {
      unlockMosaicGroup(activeMosaicId);
    }
  }, [activeMosaicId, unlockMosaicGroup]);

  const handleRemove = useCallback(() => {
    if (activeMosaicId) {
      removeMosaicGroup(activeMosaicId);
      setLastMosaicId(null);
      setShowItemList(false);
    }
  }, [activeMosaicId, removeMosaicGroup]);

  const handleRemoveItem = useCallback((itemId: string) => {
    removeItem(itemId);
  }, [removeItem]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-5">
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-pink-500" />
            选择形状
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {SHAPE_TEMPLATES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => setSelectedShape(shape.id)}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-xl text-lg transition-all duration-200",
                  selectedShape === shape.id
                    ? "bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg scale-105"
                    : "bg-gray-50 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 text-gray-600 hover:scale-105"
                )}
                title={shape.name}
              >
                <span className="text-xl">{shape.icon}</span>
                <span className="text-[10px] mt-0.5 opacity-80">{shape.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-500" />
            颜色主题
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {COLOR_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedColor(cat.id)}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden",
                  selectedColor === cat.id
                    ? "ring-2 ring-purple-500 ring-offset-2 scale-105 shadow-lg"
                    : "hover:scale-105"
                )}
                title={cat.name}
              >
                <div 
                  className="absolute inset-0"
                  style={{ 
                    background: cat.color,
                    borderRadius: 'inherit'
                  }}
                />
                <div className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-colors" />
                <span className="relative z-10 text-[10px] font-medium text-white drop-shadow-sm">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-blue-500" />
            拼贴风格
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {MOSAIC_STYLES.map((style) => (
              <button
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl transition-all duration-200",
                  selectedStyle === style.key
                    ? "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-md"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}
              >
                {style.icon}
                <span className="text-xs font-medium">{style.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            {MOSAIC_STYLES.find(s => s.key === selectedStyle)?.description}
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-green-500" />
            密度与大小
          </h4>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>格子大小</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{cellSize}px</span>
            </div>
            <div className="flex gap-1">
              {CELL_SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setCellSize(preset.value)}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-medium rounded-lg transition-all",
                    cellSize === preset.value
                      ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>表情大小</span>
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{Math.round(emojiScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.5}
              step={0.05}
              value={emojiScale}
              onChange={(e) => setEmojiScale(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
            <RefreshCcw className="w-4 h-4 text-gray-500" />
            生成选项
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all">
              <div className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-700">生成前清空画布</span>
              </div>
              <div 
                onClick={() => setClearBeforeGenerate(!clearBeforeGenerate)}
                className={cn(
                  "w-11 h-6 rounded-full transition-all relative",
                  clearBeforeGenerate ? "bg-gradient-to-r from-orange-400 to-red-500" : "bg-gray-300"
                )}
              >
                <div 
                  className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                    clearBeforeGenerate ? "left-[22px]" : "left-0.5"
                  )}
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-all">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">生成后不可点击</span>
              </div>
              <div 
                onClick={() => setLockAfterGenerate(!lockAfterGenerate)}
                className={cn(
                  "w-11 h-6 rounded-full transition-all relative",
                  lockAfterGenerate ? "bg-gradient-to-r from-blue-400 to-indigo-500" : "bg-gray-300"
                )}
              >
                <div 
                  className={cn(
                    "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-200",
                    lockAfterGenerate ? "left-[22px]" : "left-0.5"
                  )}
                />
              </div>
            </label>
          </div>
        </div>

        {selectedStyle === 'random' && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-orange-500" />
              随机变化
            </h4>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>旋转变化</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{Math.round(rotationVariation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={rotationVariation}
                onChange={(e) => setRotationVariation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>位置偏移</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{Math.round(offsetVariation * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={offsetVariation}
                onChange={(e) => setOffsetVariation(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        )}

        <div className="pt-2">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">预计生成</span>
              <span className="font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                ~{estimatedCount} 个表情
              </span>
            </div>
          </div>
        </div>

        {activeMosaicId && mosaicItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              拼贴组操作
              <span className="text-xs font-normal text-gray-400 ml-auto">{mosaicItems.length} 个元素</span>
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {hasLockedItems && (
                <button
                  onClick={handleUnlock}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-sm bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  解锁
                </button>
              )}
              <button
                onClick={() => setShowItemList(!showItemList)}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-sm transition-all",
                  showItemList
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                {showItemList ? '收起' : '逐个删除'}
              </button>
              <button
                onClick={handleRemove}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-medium text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除整组
              </button>
            </div>
            
            {hasLockedItems && (
              <p className="text-xs text-gray-400 text-center">
                元素当前不可点击，点击「解锁」后可自由拖动调整
              </p>
            )}
            
            {showItemList && mosaicItems.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50">
                <div className="grid grid-cols-8 gap-1 p-2">
                  {mosaicItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square flex items-center justify-center bg-white rounded-lg hover:bg-red-50 group transition-colors"
                    >
                      <span className="text-lg">
                        {item.type === 'emoji' ? (item as EmojiItem).emoji : '📝'}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 mt-2">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={cn(
            "w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2",
            isGenerating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          <Sparkles className="w-5 h-5" />
          {isGenerating ? '生成中...' : '生成拼贴画'}
        </button>
      </div>
    </div>
  );
}

export function MosaicPanel() {
  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent mb-1">
          ✨ 表情拼贴
        </h3>
        <p className="text-xs text-gray-500">选择形状和颜色，一键生成拼贴画</p>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <MosaicControls />
      </div>

      <div className="p-3 bg-gradient-to-r from-pink-50/50 to-purple-50/50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          点击生成，表情将自动添加到画布
        </p>
      </div>
    </div>
  );
}

