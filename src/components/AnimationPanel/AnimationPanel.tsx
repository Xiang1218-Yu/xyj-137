import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Download,
  Wand2,
  Layers,
  Gauge,
  Timer,
  Repeat,
  Sparkles,
  RefreshCcw,
} from 'lucide-react';
import {
  useCanvasStore,
  ANIMATION_PRESETS,
  DEFAULT_ANIMATION_CONFIG,
  type AnimationPreset,
  type AnimationConfig,
  type EmojiItem,
  type TextItem,
} from '@/hooks/useCanvasStore';
import { buildBackgroundStyles } from '@/utils/backgroundStyles';
import { generateAnimationFrames, downloadGIF, downloadAPNG } from '@/utils/animationEncoder';

export function AnimationPanel() {
  const {
    items,
    selectedId,
    canvasSize,
    background,
    animationSettings,
    setItemAnimation,
    setAllItemsAnimation,
    updateAnimationSettings,
    playAnimation,
    pauseAnimation,
    setCurrentFrame,
  } = useCanvasStore();

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const selectedItem = items.find(item => item.id === selectedId);
  const currentAnimation: AnimationConfig = selectedItem?.animation || { ...DEFAULT_ANIMATION_CONFIG };

  const hasItems = items.length > 0;
  const hasAnyAnimation = items.some(item => item.animation && item.animation.preset !== 'none');
  const { isPlaying, frameCount, frameDelay, currentFrame, format } = animationSettings;

  const handlePresetSelect = (preset: AnimationPreset) => {
    const config: Partial<AnimationConfig> = {
      ...DEFAULT_ANIMATION_CONFIG,
      preset,
    };
    if (selectedId) {
      setItemAnimation(selectedId, config);
    } else if (hasItems) {
      setAllItemsAnimation(config);
    }
  };

  const handleAnimationParamChange = (key: keyof AnimationConfig, value: number | boolean) => {
    const update: Partial<AnimationConfig> = { [key]: value } as Partial<AnimationConfig>;
    if (selectedId) {
      setItemAnimation(selectedId, update);
    } else if (hasItems) {
      setAllItemsAnimation(update);
    }
  };

  const handlePlayPause = () => {
    if (!hasAnyAnimation) {
      handlePresetSelect('bounce');
    }
    if (isPlaying) {
      pauseAnimation();
    } else {
      playAnimation();
    }
  };

  const handlePrevFrame = () => {
    setCurrentFrame((prev) => (prev - 1 + frameCount) % frameCount);
  };

  const handleNextFrame = () => {
    setCurrentFrame((prev) => (prev + 1) % frameCount);
  };

  const handleResetAnimation = () => {
    setCurrentFrame(0);
    pauseAnimation();
  };

  const handleExport = async () => {
    if (!hasItems || isExporting) return;
    
    setIsExporting(true);
    setExportProgress(0);

    try {
      const frames = await generateAnimationFrames(
        items,
        canvasSize.width,
        canvasSize.height,
        frameCount,
        frameDelay,
        background,
        buildBackgroundStyles
      );

      const filename = `animation-${Date.now()}.${format === 'gif' ? 'gif' : 'png'}`;

      if (format === 'gif') {
        downloadGIF(frames, canvasSize.width, canvasSize.height, filename);
      } else {
        downloadAPNG(frames, canvasSize.width, canvasSize.height, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportProgress(100);
      setTimeout(() => setExportProgress(0), 500);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 flex items-center gap-2 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
          <Wand2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-800">动画面板</h2>
          <p className="text-xs text-gray-500">让你的表情动起来</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-1 -mr-1 space-y-3 pb-2">
        <div className="px-3 py-2 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
          <p className="text-xs text-pink-700 font-medium">
            {selectedId
              ? `🎯 已选中元素: ${selectedItem?.type === 'emoji' ? (selectedItem as EmojiItem).emoji : selectedItem?.type === 'text' ? (selectedItem as TextItem).text : selectedItem?.type}`
              : hasItems
              ? '🎨 将应用到所有元素'
              : '✨ 先添加元素到画布'}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">预设动画</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {ANIMATION_PRESETS.map((preset) => {
              const isActive = currentAnimation.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset.id)}
                  disabled={!hasItems}
                  title={preset.description}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                    isActive
                      ? 'border-purple-400 bg-purple-50 shadow-md scale-105'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="text-xl">{preset.icon}</span>
                  <span className="text-xs text-gray-600 font-medium">{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">速度</span>
              </div>
              <span className="text-xs text-gray-500">{currentAnimation.speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={currentAnimation.speed}
              onChange={(e) => handleAnimationParamChange('speed', parseFloat(e.target.value))}
              disabled={!hasItems}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium text-gray-700">强度</span>
              </div>
              <span className="text-xs text-gray-500">{currentAnimation.intensity.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={currentAnimation.intensity}
              onChange={(e) => handleAnimationParamChange('intensity', parseFloat(e.target.value))}
              disabled={!hasItems}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 disabled:opacity-40"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium text-gray-700">延迟帧</span>
              </div>
              <span className="text-xs text-gray-500">{currentAnimation.delay}帧</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="1"
              value={currentAnimation.delay}
              onChange={(e) => handleAnimationParamChange('delay', parseInt(e.target.value))}
              disabled={!hasItems}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500 disabled:opacity-40"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Repeat className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-medium text-gray-700">循环播放</span>
            </div>
            <button
              onClick={() => handleAnimationParamChange('loop', !currentAnimation.loop)}
              disabled={!hasItems}
              className={`w-10 h-5 rounded-full transition-all relative ${
                currentAnimation.loop ? 'bg-cyan-500' : 'bg-gray-300'
              } disabled:opacity-40`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-all ${
                  currentAnimation.loop ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCcw className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-700">播放控制</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={handleResetAnimation}
              disabled={!hasItems}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="重置"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrevFrame}
              disabled={!hasItems || isPlaying}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="上一帧"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={handlePlayPause}
              disabled={!hasItems}
              className={`p-3 rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                isPlaying
                  ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:shadow-xl'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-xl'
              }`}
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button
              onClick={handleNextFrame}
              disabled={!hasItems || isPlaying}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="下一帧"
            >
              <SkipForward className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateAnimationSettings({ currentFrame: frameCount - 1 })}
              disabled={!hasItems}
              className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              title="跳转到最后"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 whitespace-nowrap">帧 {currentFrame + 1}/{frameCount}</span>
            <input
              type="range"
              min="0"
              max={frameCount - 1}
              step="1"
              value={currentFrame}
              onChange={(e) => setCurrentFrame(parseInt(e.target.value))}
              disabled={!hasItems || isPlaying}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-40"
            />
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-gray-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">总帧数</span>
              <span className="text-xs text-gray-500">{frameCount}帧</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={frameCount}
              onChange={(e) => updateAnimationSettings({ frameCount: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">帧间隔</span>
              <span className="text-xs text-gray-500">{frameDelay}ms</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="10"
              value={frameDelay}
              onChange={(e) => updateAnimationSettings({ frameDelay: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-gray-700 mb-2 block">导出格式</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateAnimationSettings({ format: 'gif' })}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  format === 'gif'
                    ? 'border-purple-400 bg-purple-50 text-purple-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300'
                }`}
              >
                🖼️ GIF
              </button>
              <button
                onClick={() => updateAnimationSettings({ format: 'apng' })}
                className={`py-2 px-3 rounded-xl text-sm font-medium transition-all border ${
                  format === 'apng'
                    ? 'border-blue-400 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                }`}
              >
                🎞️ APNG
              </button>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100">
          <button
            onClick={handleExport}
            disabled={!hasItems || isExporting || !hasAnyAnimation}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-medium shadow-lg transition-all ${
              isExporting
                ? 'bg-gray-400 text-white cursor-wait'
                : !hasAnyAnimation
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
            } disabled:hover:scale-100`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>导出中... {exportProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>导出 {format === 'gif' ? 'GIF' : 'APNG'}</span>
                <Sparkles className="w-4 h-4 opacity-80" />
              </>
            )}
          </button>
          {!hasAnyAnimation && hasItems && (
            <p className="text-xs text-center text-gray-400 mt-2">
              💡 请先选择一个动画预设
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
