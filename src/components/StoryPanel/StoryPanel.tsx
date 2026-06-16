import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Frame,
  MessageCircle,
  Download,
  Eye,
  EyeOff,
  Type,
  Palette,
  GripVertical,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  useCanvasStore,
  FRAME_BORDER_OPTIONS,
  SPEECH_BUBBLE_OPTIONS,
  DEFAULT_SPEECH_BUBBLE,
  type FrameBorderStyle,
  type SpeechBubbleStyle,
} from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';
import { exportStoryAsLongImage } from '@/utils/exportStory';

type StoryTab = 'frames' | 'border' | 'bubble' | 'settings';

export function StoryPanel() {
  const {
    isStoryMode,
    frames,
    currentFrameId,
    storyTitle,
    showStoryTitle,
    storyTitleStyle,
    toggleStoryMode,
    addStoryFrame,
    removeStoryFrame,
    duplicateStoryFrame,
    setCurrentStoryFrame,
    reorderStoryFrames,
    updateStoryFrame,
    setStoryTitle,
    toggleShowStoryTitle,
    updateStoryTitleStyle,
    updateFrameBorder,
    addSpeechBubble,
    updateSpeechBubble,
    removeSpeechBubble,
    saveCurrentFrameToStory,
    canvasSize,
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState<StoryTab>('frames');
  const [isExporting, setIsExporting] = useState(false);

  const currentFrame = frames.find(f => f.id === currentFrameId);
  const sortedFrames = [...frames].sort((a, b) => a.order - b.order);
  const currentIndex = sortedFrames.findIndex(f => f.id === currentFrameId);

  const handleExportLongImage = async () => {
    if (frames.length === 0) return;
    setIsExporting(true);
    try {
      await exportStoryAsLongImage();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMoveFrame = (direction: 'up' | 'down') => {
    const fromIndex = currentIndex;
    const toIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (toIndex < 0 || toIndex >= sortedFrames.length) return;
    reorderStoryFrames(fromIndex, toIndex);
  };

  if (!isStoryMode) {
    return (
      <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden p-6 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center mb-4 shadow-lg">
          <BookOpen className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          表情故事模式
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          创建多格漫画，讲述你的表情故事
          <br />
          支持分镜边框、对话气泡和长图导出
        </p>
        <button
          onClick={toggleStoryMode}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          <BookOpen className="w-5 h-5" />
          <span>开启故事模式</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              表情故事
            </h3>
          </div>
          <button
            onClick={toggleStoryMode}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="退出故事模式"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-gray-100 rounded-xl">
          {[
            { key: 'frames' as StoryTab, label: '分镜', icon: <Frame className="w-3.5 h-3.5" /> },
            { key: 'border' as StoryTab, label: '边框', icon: <Frame className="w-3.5 h-3.5" /> },
            { key: 'bubble' as StoryTab, label: '气泡', icon: <MessageCircle className="w-3.5 h-3.5" /> },
            { key: 'settings' as StoryTab, label: '设置', icon: <Palette className="w-3.5 h-3.5" /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 px-1 rounded-lg text-xs font-medium transition-all",
                activeTab === tab.key
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'frames' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Frame className="w-4 h-4" />
                分镜列表 ({frames.length})
              </h4>
              <button
                onClick={() => {
                  saveCurrentFrameToStory();
                  addStoryFrame();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新建分镜</span>
              </button>
            </div>

            <div className="space-y-2">
              {sortedFrames.map((frame) => (
                <div
                  key={frame.id}
                  onClick={() => {
                    saveCurrentFrameToStory();
                    setCurrentStoryFrame(frame.id);
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 p-2 rounded-xl border-2 transition-all cursor-pointer",
                    currentFrameId === frame.id
                      ? "border-purple-400 bg-purple-50"
                      : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-white"
                  )}
                >
                  <div className="text-gray-400 group-hover:text-gray-500 cursor-grab">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl flex-shrink-0 overflow-hidden">
                    {frame.items.length > 0 ? '🎨' : '⬜'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      value={frame.title}
                      onChange={(e) => updateStoryFrame(frame.id, { title: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-sm font-medium text-gray-800 bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-purple-300 rounded px-1 py-0.5"
                    />
                    <p className="text-xs text-gray-400">{frame.items.length} 个元素</p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        saveCurrentFrameToStory();
                        duplicateStoryFrame(frame.id);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors"
                      title="复制分镜"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (frames.length > 1) {
                          removeStoryFrame(frame.id);
                        }
                      }}
                      disabled={frames.length <= 1}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      title="删除分镜"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {currentFrame && frames.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => handleMoveFrame('up')}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  上移
                </button>
                <button
                  onClick={() => handleMoveFrame('down')}
                  disabled={currentIndex === frames.length - 1}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  下移
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleExportLongImage}
                disabled={isExporting || frames.length === 0}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium shadow-lg transition-all",
                  isExporting
                    ? "bg-gray-300 text-gray-500 cursor-wait"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>一键导出长图</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'border' && currentFrame && (
          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Frame className="w-4 h-4" />
              分镜边框样式
            </h4>

            <div className="space-y-2">
              <p className="text-xs text-gray-500">选择边框风格</p>
              <div className="grid grid-cols-2 gap-1.5">
                {FRAME_BORDER_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => updateFrameBorder(currentFrame.id, { style: opt.id as FrameBorderStyle })}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all",
                      currentFrame.border.style === opt.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {currentFrame.border.style !== 'none' && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">边框颜色</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {currentFrame.border.color}
                      </span>
                      <label className="relative w-7 h-7 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                        <input
                          type="color"
                          value={currentFrame.border.color}
                          onChange={(e) => updateFrameBorder(currentFrame.id, { color: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: currentFrame.border.color }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">边框粗细</p>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                      {currentFrame.border.width}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={1}
                    value={currentFrame.border.width}
                    onChange={(e) => updateFrameBorder(currentFrame.id, { width: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">圆角半径</p>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                      {currentFrame.border.radius}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    step={1}
                    value={currentFrame.border.radius}
                    onChange={(e) => updateFrameBorder(currentFrame.id, { radius: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'bubble' && currentFrame && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                对话气泡 ({currentFrame.speechBubbles.length})
              </h4>
              <button
                onClick={() =>
                  addSpeechBubble(currentFrame.id, {
                    ...DEFAULT_SPEECH_BUBBLE,
                    text: '双击编辑文字',
                    x: canvasSize.width / 2 - 75,
                    y: 20,
                    width: 150,
                  })
                }
                className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg text-xs font-medium hover:shadow-md transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加气泡</span>
              </button>
            </div>

            {currentFrame.speechBubbles.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">还没有对话气泡</p>
                <p className="text-xs">点击上方按钮添加</p>
              </div>
            ) : (
              <div className="space-y-3">
                {currentFrame.speechBubbles.map((bubble, idx) => (
                  <div key={bubble.id} className="p-3 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">气泡 #{idx + 1}</span>
                      <button
                        onClick={() => removeSpeechBubble(currentFrame.id, bubble.id)}
                        className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <input
                      value={bubble.text}
                      onChange={(e) =>
                        updateSpeechBubble(currentFrame.id, bubble.id, { text: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent"
                      placeholder="输入气泡文字..."
                    />

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">气泡样式</p>
                      <div className="grid grid-cols-3 gap-1">
                        {SPEECH_BUBBLE_OPTIONS.filter(o => o.id !== 'none').map(opt => (
                          <button
                            key={opt.id}
                            onClick={() =>
                              updateSpeechBubble(currentFrame.id, bubble.id, {
                                style: opt.id as SpeechBubbleStyle,
                              })
                            }
                            className={cn(
                              "flex items-center gap-1 px-1.5 py-1.5 rounded-md text-[10px] font-medium transition-all",
                              bubble.style === opt.id
                                ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                            )}
                          >
                            <span>{opt.icon}</span>
                            <span>{opt.name.replace('气泡', '')}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-600">字号</p>
                        <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                          {bubble.fontSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={48}
                        step={1}
                        value={bubble.fontSize}
                        onChange={(e) =>
                          updateSpeechBubble(currentFrame.id, bubble.id, {
                            fontSize: Number(e.target.value),
                          })
                        }
                        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">文字颜色</p>
                        <label className="relative w-full h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors block">
                          <input
                            type="color"
                            value={bubble.textColor}
                            onChange={(e) =>
                              updateSpeechBubble(currentFrame.id, bubble.id, { textColor: e.target.value })
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: bubble.textColor }}
                          />
                        </label>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">气泡背景</p>
                        <label className="relative w-full h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-colors block">
                          <input
                            type="color"
                            value={bubble.backgroundColor}
                            onChange={(e) =>
                              updateSpeechBubble(currentFrame.id, bubble.id, {
                                backgroundColor: e.target.value,
                              })
                            }
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <div
                            className="absolute inset-0"
                            style={{ backgroundColor: bubble.backgroundColor }}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500">尾巴方向</p>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { key: 'top', icon: <ArrowUp className="w-3 h-3" /> },
                          { key: 'bottom', icon: <ArrowDown className="w-3 h-3" /> },
                          { key: 'left', icon: <ArrowLeft className="w-3 h-3" /> },
                          { key: 'right', icon: <ArrowRight className="w-3 h-3" /> },
                        ].map(dir => (
                          <button
                            key={dir.key}
                            onClick={() =>
                              updateSpeechBubble(currentFrame.id, bubble.id, {
                                tailPosition: dir.key as 'left' | 'right' | 'top' | 'bottom',
                              })
                            }
                            className={cn(
                              "flex items-center justify-center py-1.5 rounded-md text-xs transition-all",
                              bubble.tailPosition === dir.key
                                ? "bg-blue-500 text-white"
                                : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                            )}
                          >
                            {dir.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-5">
            <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Type className="w-4 h-4" />
              故事标题
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleShowStoryTitle}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showStoryTitle
                    ? "bg-purple-100 text-purple-600"
                    : "bg-gray-100 text-gray-400"
                )}
                title={showStoryTitle ? '隐藏标题' : '显示标题'}
              >
                {showStoryTitle ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <input
                value={storyTitle}
                onChange={(e) => setStoryTitle(e.target.value)}
                disabled={!showStoryTitle}
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
                placeholder="输入故事标题..."
              />
            </div>

            {showStoryTitle && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">标题字号</p>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                      {storyTitleStyle.fontSize}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={72}
                    step={1}
                    value={storyTitleStyle.fontSize}
                    onChange={(e) => updateStoryTitleStyle({ fontSize: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-600">标题颜色</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                        {storyTitleStyle.color}
                      </span>
                      <label className="relative w-7 h-7 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                        <input
                          type="color"
                          value={storyTitleStyle.color}
                          onChange={(e) => updateStoryTitleStyle({ color: e.target.value })}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: storyTitleStyle.color }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                快捷操作
              </h4>
              <button
                onClick={saveCurrentFrameToStory}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>💾</span>
                <span>保存当前分镜</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
