import { create } from 'zustand';

export type CanvasItemType = 'emoji' | 'text' | 'shape' | 'brush';
export type BackgroundMode = 'solid' | 'gradient' | 'pattern';
export type PatternType = 'dots' | 'grid' | 'lines' | 'diagonal' | 'waves' | 'zigzag';
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'ellipse' | 'star';
export type DrawingTool = 'select' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'ellipse' | 'star' | 'brush';
export type AnimationPreset = 'none' | 'rotate' | 'bounce' | 'shake' | 'appear' | 'pulse' | 'swing' | 'float';
export type FrameBorderStyle = 'none' | 'solid' | 'dashed' | 'dotted' | 'double' | 'comic' | 'movie';
export type SpeechBubbleStyle = 'none' | 'round' | 'speech' | 'thought' | 'shout' | 'whisper';

export interface BaseCanvasItem {
  id: string;
  type: CanvasItemType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  locked?: boolean;
  mosaicId?: string;
  animation?: AnimationConfig;
}

export interface EmojiItem extends BaseCanvasItem {
  type: 'emoji';
  emoji: string;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface TextItem extends BaseCanvasItem {
  type: 'text';
  text: string;
  style: TextStyle;
}

export interface ShapeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
  opacity: number;
}

export interface ShapeItem extends BaseCanvasItem {
  type: 'shape';
  shapeType: ShapeType;
  width: number;
  height: number;
  style: ShapeStyle;
}

export interface BrushStyle {
  color: string;
  strokeWidth: number;
  opacity: number;
  smoothness: number;
}

export interface BrushPoint {
  x: number;
  y: number;
  pressure?: number;
}

export interface BrushItem extends BaseCanvasItem {
  type: 'brush';
  points: BrushPoint[];
  style: BrushStyle;
  width: number;
  height: number;
}

export type CanvasItem = EmojiItem | TextItem | ShapeItem | BrushItem;

export interface AnimationConfig {
  preset: AnimationPreset;
  speed: number;
  intensity: number;
  delay: number;
  loop: boolean;
}

export interface AnimationSettings {
  isPlaying: boolean;
  frameCount: number;
  frameDelay: number;
  currentFrame: number;
  format: 'gif' | 'apng';
}

export interface SolidBackground {
  mode: 'solid';
  color: string;
  opacity: number;
}

export interface GradientBackground {
  mode: 'gradient';
  type: 'linear' | 'radial' | 'conic';
  angle: number;
  colors: { color: string; stop: number }[];
  opacity: number;
}

export interface PatternBackground {
  mode: 'pattern';
  pattern: PatternType;
  color: string;
  backgroundColor: string;
  size: number;
  opacity: number;
}

export type CanvasBackground = SolidBackground | GradientBackground | PatternBackground;

export interface BackgroundPreset {
  id: string;
  name: string;
  mode: BackgroundMode;
  background: CanvasBackground;
  preview: string;
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  preset: 'none',
  speed: 1,
  intensity: 1,
  delay: 0,
  loop: true,
};

export const ANIMATION_PRESETS: { id: AnimationPreset; name: string; icon: string; description: string }[] = [
  { id: 'none', name: '无', icon: '🚫', description: '没有动画' },
  { id: 'rotate', name: '旋转', icon: '🔄', description: '旋转动画' },
  { id: 'bounce', name: '弹跳', icon: '🏀', description: '弹跳动画' },
  { id: 'shake', name: '抖动', icon: '📳', description: '抖动动画' },
  { id: 'appear', name: '出现', icon: '✨', description: '出现动画' },
  { id: 'pulse', name: '脉冲', icon: '💓', description: '脉冲动画' },
  { id: 'swing', name: '摇摆', icon: '🎭', description: '摇摆动画' },
  { id: 'float', name: '漂浮', icon: '🎈', description: '漂浮动画' },
];

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 32,
  color: '#333333',
  strokeColor: '#ffffff',
  strokeWidth: 0,
  shadowColor: 'rgba(0,0,0,0.3)',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
};

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#6366F1',
  stroke: '#4F46E5',
  strokeWidth: 2,
  borderRadius: 8,
  opacity: 1,
};

export const DEFAULT_BRUSH_STYLE: BrushStyle = {
  color: '#6366F1',
  strokeWidth: 4,
  opacity: 1,
  smoothness: 0.5,
};

export const SOLID_COLOR_PRESETS: BackgroundPreset[] = [
  { id: 'solid-white', name: '纯白', mode: 'solid', preview: '#FFFFFF', background: { mode: 'solid', color: '#FFFFFF', opacity: 1 } },
  { id: 'solid-black', name: '纯黑', mode: 'solid', preview: '#111111', background: { mode: 'solid', color: '#111111', opacity: 1 } },
  { id: 'solid-pink', name: '樱花粉', mode: 'solid', preview: '#FFF0F5', background: { mode: 'solid', color: '#FFF0F5', opacity: 1 } },
  { id: 'solid-blue', name: '天空蓝', mode: 'solid', preview: '#E0F2FE', background: { mode: 'solid', color: '#E0F2FE', opacity: 1 } },
  { id: 'solid-green', name: '薄荷绿', mode: 'solid', preview: '#ECFDF5', background: { mode: 'solid', color: '#ECFDF5', opacity: 1 } },
  { id: 'solid-yellow', name: '柠檬黄', mode: 'solid', preview: '#FEF9C3', background: { mode: 'solid', color: '#FEF9C3', opacity: 1 } },
  { id: 'solid-purple', name: '薰衣草', mode: 'solid', preview: '#F3E8FF', background: { mode: 'solid', color: '#F3E8FF', opacity: 1 } },
  { id: 'solid-orange', name: '蜜桃橙', mode: 'solid', preview: '#FFEDD5', background: { mode: 'solid', color: '#FFEDD5', opacity: 1 } },
  { id: 'solid-gray', name: '月光灰', mode: 'solid', preview: '#F3F4F6', background: { mode: 'solid', color: '#F3F4F6', opacity: 1 } },
  { id: 'solid-cream', name: '奶油色', mode: 'solid', preview: '#FAF5E4', background: { mode: 'solid', color: '#FAF5E4', opacity: 1 } },
  { id: 'solid-mint', name: '薄荷青', mode: 'solid', preview: '#CFFAFE', background: { mode: 'solid', color: '#CFFAFE', opacity: 1 } },
  { id: 'solid-rose', name: '玫瑰红', mode: 'solid', preview: '#FFE4E6', background: { mode: 'solid', color: '#FFE4E6', opacity: 1 } },
];

export const GRADIENT_PRESETS: BackgroundPreset[] = [
  {
    id: 'gradient-sunset', name: '日落', mode: 'gradient',
    preview: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#FF6B6B', stop: 0 }, { color: '#FFE66D', stop: 1 }]
    }
  },
  {
    id: 'gradient-ocean', name: '海洋', mode: 'gradient',
    preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#667eea', stop: 0 }, { color: '#764ba2', stop: 1 }]
    }
  },
  {
    id: 'gradient-aurora', name: '极光', mode: 'gradient',
    preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#a8edea', stop: 0 }, { color: '#fed6e3', stop: 1 }]
    }
  },
  {
    id: 'gradient-fire', name: '火焰', mode: 'gradient',
    preview: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#f12711', stop: 0 }, { color: '#f5af19', stop: 1 }]
    }
  },
  {
    id: 'gradient-forest', name: '森林', mode: 'gradient',
    preview: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#134E5E', stop: 0 }, { color: '#71B280', stop: 1 }]
    }
  },
  {
    id: 'gradient-candy', name: '糖果', mode: 'gradient',
    preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#ff9a9e', stop: 0 }, { color: '#fecfef', stop: 0.5 }, { color: '#fecfef', stop: 1 }]
    }
  },
  {
    id: 'gradient-dream', name: '梦境', mode: 'gradient',
    preview: 'linear-gradient(135deg, #fff5f7 0%, #f5f3ff 50%, #f0f9ff 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#fff5f7', stop: 0 }, { color: '#f5f3ff', stop: 0.5 }, { color: '#f0f9ff', stop: 1 }]
    }
  },
  {
    id: 'gradient-radial-sun', name: '旭日', mode: 'gradient',
    preview: 'radial-gradient(circle, #f6d365 0%, #fda085 100%)',
    background: {
      mode: 'gradient', type: 'radial', angle: 0, opacity: 1,
      colors: [{ color: '#f6d365', stop: 0 }, { color: '#fda085', stop: 1 }]
    }
  },
  {
    id: 'gradient-radial-bloom', name: '绽放', mode: 'gradient',
    preview: 'radial-gradient(circle, #fbc2eb 0%, #a6c1ee 100%)',
    background: {
      mode: 'gradient', type: 'radial', angle: 0, opacity: 1,
      colors: [{ color: '#fbc2eb', stop: 0 }, { color: '#a6c1ee', stop: 1 }]
    }
  },
  {
    id: 'gradient-radial-ocean', name: '深海', mode: 'gradient',
    preview: 'radial-gradient(circle, #2193b0 0%, #6dd5ed 100%)',
    background: {
      mode: 'gradient', type: 'radial', angle: 0, opacity: 1,
      colors: [{ color: '#2193b0', stop: 0 }, { color: '#6dd5ed', stop: 1 }]
    }
  },
  {
    id: 'gradient-triple', name: '彩虹', mode: 'gradient',
    preview: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#FF6B6B', stop: 0 }, { color: '#4ECDC4', stop: 0.5 }, { color: '#45B7D1', stop: 1 }]
    }
  },
  {
    id: 'gradient-night', name: '夜空', mode: 'gradient',
    preview: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    background: {
      mode: 'gradient', type: 'linear', angle: 135, opacity: 1,
      colors: [{ color: '#0f0c29', stop: 0 }, { color: '#302b63', stop: 0.5 }, { color: '#24243e', stop: 1 }]
    }
  },
];

export const PATTERN_PRESETS: BackgroundPreset[] = [
  { id: 'pattern-dots-pink', name: '粉色圆点', mode: 'pattern', preview: 'dot:#F472B6:#FFF0F5', background: { mode: 'pattern', pattern: 'dots', color: '#F472B6', backgroundColor: '#FFF0F5', size: 20, opacity: 1 } },
  { id: 'pattern-dots-blue', name: '蓝色圆点', mode: 'pattern', preview: 'dot:#3B82F6:#E0F2FE', background: { mode: 'pattern', pattern: 'dots', color: '#3B82F6', backgroundColor: '#E0F2FE', size: 20, opacity: 1 } },
  { id: 'pattern-grid-purple', name: '紫色网格', mode: 'pattern', preview: 'grid:#A855F7:#F5F3FF', background: { mode: 'pattern', pattern: 'grid', color: '#A855F7', backgroundColor: '#F5F3FF', size: 25, opacity: 1 } },
  { id: 'pattern-grid-green', name: '绿色网格', mode: 'pattern', preview: 'grid:#10B981:#ECFDF5', background: { mode: 'pattern', pattern: 'grid', color: '#10B981', backgroundColor: '#ECFDF5', size: 25, opacity: 1 } },
  { id: 'pattern-lines-orange', name: '橙色条纹', mode: 'pattern', preview: 'line:#F97316:#FFEDD5', background: { mode: 'pattern', pattern: 'lines', color: '#F97316', backgroundColor: '#FFEDD5', size: 15, opacity: 1 } },
  { id: 'pattern-lines-gray', name: '灰色条纹', mode: 'pattern', preview: 'line:#9CA3AF:#F3F4F6', background: { mode: 'pattern', pattern: 'lines', color: '#9CA3AF', backgroundColor: '#F3F4F6', size: 15, opacity: 1 } },
  { id: 'pattern-diagonal-red', name: '红色斜纹', mode: 'pattern', preview: 'diag:#EF4444:#FEF2F2', background: { mode: 'pattern', pattern: 'diagonal', color: '#EF4444', backgroundColor: '#FEF2F2', size: 20, opacity: 1 } },
  { id: 'pattern-diagonal-teal', name: '青色斜纹', mode: 'pattern', preview: 'diag:#14B8A6:#F0FDFA', background: { mode: 'pattern', pattern: 'diagonal', color: '#14B8A6', backgroundColor: '#F0FDFA', size: 20, opacity: 1 } },
  { id: 'pattern-waves-cyan', name: '青色波浪', mode: 'pattern', preview: 'wave:#06B6D4:#CFFAFE', background: { mode: 'pattern', pattern: 'waves', color: '#06B6D4', backgroundColor: '#CFFAFE', size: 30, opacity: 1 } },
  { id: 'pattern-waves-violet', name: '紫色波浪', mode: 'pattern', preview: 'wave:#8B5CF6:#EDE9FE', background: { mode: 'pattern', pattern: 'waves', color: '#8B5CF6', backgroundColor: '#EDE9FE', size: 30, opacity: 1 } },
  { id: 'pattern-zigzag-amber', name: '琥珀锯齿', mode: 'pattern', preview: 'zig:#F59E0B:#FFFBEB', background: { mode: 'pattern', pattern: 'zigzag', color: '#F59E0B', backgroundColor: '#FFFBEB', size: 25, opacity: 1 } },
  { id: 'pattern-zigzag-indigo', name: '靛蓝锯齿', mode: 'pattern', preview: 'zig:#6366F1:#EEF2FF', background: { mode: 'pattern', pattern: 'zigzag', color: '#6366F1', backgroundColor: '#EEF2FF', size: 25, opacity: 1 } },
];

export const ALL_BACKGROUND_PRESETS = [
  ...SOLID_COLOR_PRESETS,
  ...GRADIENT_PRESETS,
  ...PATTERN_PRESETS,
];

export const DEFAULT_BACKGROUND: CanvasBackground = {
  mode: 'gradient',
  type: 'linear',
  angle: 135,
  opacity: 1,
  colors: [
    { color: '#fff5f7', stop: 0 },
    { color: '#f5f3ff', stop: 0.5 },
    { color: '#f0f9ff', stop: 1 }
  ]
};

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  isPlaying: false,
  frameCount: 30,
  frameDelay: 50,
  currentFrame: 0,
  format: 'gif',
};

export interface MosaicGeneratorOptions {
  shape: string;
  colorCategory: string;
  cellSize: number;
  style: string;
  emojiScale: number;
  rotationVariation: number;
  offsetVariation: number;
  locked: boolean;
  clearBeforeGenerate: boolean;
}

export interface FrameBorderConfig {
  style: FrameBorderStyle;
  color: string;
  width: number;
  radius: number;
}

export interface SpeechBubble {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  style: SpeechBubbleStyle;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  tailPosition: 'left' | 'right' | 'top' | 'bottom';
}

export interface StoryFrame {
  id: string;
  title: string;
  items: CanvasItem[];
  background: CanvasBackground;
  border: FrameBorderConfig;
  speechBubbles: SpeechBubble[];
  order: number;
}

export interface StoryBoardState {
  isStoryMode: boolean;
  frames: StoryFrame[];
  currentFrameId: string | null;
  storyTitle: string;
  showStoryTitle: boolean;
  storyTitleStyle: {
    fontSize: number;
    color: string;
    fontFamily: string;
  };
}

export const DEFAULT_FRAME_BORDER: FrameBorderConfig = {
  style: 'solid',
  color: '#333333',
  width: 3,
  radius: 8,
};

export const DEFAULT_SPEECH_BUBBLE: Omit<SpeechBubble, 'id' | 'text' | 'x' | 'y' | 'width'> = {
  style: 'speech',
  fontSize: 16,
  textColor: '#333333',
  backgroundColor: '#FFFFFF',
  borderColor: '#333333',
  tailPosition: 'bottom',
};

export const DEFAULT_STORY_TITLE_STYLE = {
  fontSize: 32,
  color: '#333333',
  fontFamily: 'Georgia, serif',
};

export const FRAME_BORDER_OPTIONS: { id: FrameBorderStyle; name: string; icon: string }[] = [
  { id: 'none', name: '无边框', icon: '⬜' },
  { id: 'solid', name: '实线边框', icon: '▢' },
  { id: 'dashed', name: '虚线边框', icon: '▦' },
  { id: 'dotted', name: '点线边框', icon: '▣' },
  { id: 'double', name: '双线边框', icon: '▤' },
  { id: 'comic', name: '漫画风格', icon: '💥' },
  { id: 'movie', name: '电影边框', icon: '🎬' },
];

export const SPEECH_BUBBLE_OPTIONS: { id: SpeechBubbleStyle; name: string; icon: string }[] = [
  { id: 'none', name: '无气泡', icon: '⬜' },
  { id: 'round', name: '圆形气泡', icon: '⚪' },
  { id: 'speech', name: '对话气泡', icon: '💬' },
  { id: 'thought', name: '思考气泡', icon: '💭' },
  { id: 'shout', name: '喊叫气泡', icon: '📢' },
  { id: 'whisper', name: '低语气泡', icon: '🤫' },
];

interface CanvasState extends StoryBoardState {
  items: CanvasItem[];
  selectedId: string | null;
  history: CanvasItem[][];
  historyIndex: number;
  canvasSize: { width: number; height: number };
  background: CanvasBackground;
  currentTool: DrawingTool;
  shapeStyle: ShapeStyle;
  brushStyle: BrushStyle;
  animationSettings: AnimationSettings;
  
  addEmoji: (emoji: string) => void;
  addText: (text?: string) => void;
  addShape: (x: number, y: number, width: number, height: number, shapeType: ShapeType) => void;
  addBrush: (points: BrushPoint[], x: number, y: number, width: number, height: number) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  updateTextStyle: (id: string, styleUpdates: Partial<TextStyle>) => void;
  updateShapeStyle: (id: string, styleUpdates: Partial<ShapeStyle>) => void;
  updateBrushStyle: (id: string, styleUpdates: Partial<BrushStyle>) => void;
  selectItem: (id: string | null) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  saveToHistory: () => void;
  setBackground: (background: CanvasBackground) => void;
  setBackgroundMode: (mode: BackgroundMode) => void;
  updateSolidBackground: (updates: Partial<SolidBackground>) => void;
  updateGradientBackground: (updates: Partial<GradientBackground>) => void;
  updatePatternBackground: (updates: Partial<PatternBackground>) => void;
  applyBackgroundPreset: (preset: BackgroundPreset) => void;
  
  setCurrentTool: (tool: DrawingTool) => void;
  setShapeStyle: (style: Partial<ShapeStyle>) => void;
  setBrushStyle: (style: Partial<BrushStyle>) => void;
  setCanvasSize: (width: number, height: number) => void;
  
  setItemAnimation: (id: string, animation: Partial<AnimationConfig>) => void;
  setAllItemsAnimation: (animation: Partial<AnimationConfig>) => void;
  updateAnimationSettings: (settings: Partial<AnimationSettings>) => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  setCurrentFrame: (frame: number | ((prev: number) => number)) => void;
  
  generateMosaic: (options: MosaicGeneratorOptions) => string;
  unlockMosaicGroup: (mosaicId: string) => void;
  removeMosaicGroup: (mosaicId: string) => void;
  findMosaicIdByItemId: (itemId: string) => string | null;

  toggleStoryMode: () => void;
  setStoryMode: (enabled: boolean) => void;
  addStoryFrame: () => void;
  removeStoryFrame: (frameId: string) => void;
  duplicateStoryFrame: (frameId: string) => void;
  setCurrentStoryFrame: (frameId: string) => void;
  reorderStoryFrames: (fromIndex: number, toIndex: number) => void;
  updateStoryFrame: (frameId: string, updates: Partial<StoryFrame>) => void;
  setStoryTitle: (title: string) => void;
  toggleShowStoryTitle: () => void;
  updateStoryTitleStyle: (updates: Partial<StoryBoardState['storyTitleStyle']>) => void;
  updateFrameBorder: (frameId: string, border: Partial<FrameBorderConfig>) => void;
  addSpeechBubble: (frameId: string, bubble: Omit<SpeechBubble, 'id'>) => void;
  updateSpeechBubble: (frameId: string, bubbleId: string, updates: Partial<SpeechBubble>) => void;
  removeSpeechBubble: (frameId: string, bubbleId: string) => void;
  saveCurrentFrameToStory: () => void;
  loadStoryFrameToCanvas: (frameId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useCanvasStore = create<CanvasState>((set, get) => ({
  items: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  canvasSize: { width: 400, height: 400 },
  background: DEFAULT_BACKGROUND,
  currentTool: 'select',
  shapeStyle: { ...DEFAULT_SHAPE_STYLE },
  brushStyle: { ...DEFAULT_BRUSH_STYLE },
  animationSettings: { ...DEFAULT_ANIMATION_SETTINGS },

  isStoryMode: false,
  frames: [],
  currentFrameId: null,
  storyTitle: '我的表情故事',
  showStoryTitle: true,
  storyTitleStyle: { ...DEFAULT_STORY_TITLE_STYLE },

  addEmoji: (emoji: string) => {
    const { items, canvasSize } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    const newItem: EmojiItem = {
      id: generateId(),
      type: 'emoji',
      emoji,
      x: canvasSize.width / 2 - 40,
      y: canvasSize.height / 2 - 40,
      scale: 1,
      rotation: 0,
      zIndex: maxZ + 1,
    };
    
    set(state => {
      const newItems = [...state.items, newItem];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: newItem.id,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  addText: (text = '双击编辑文字') => {
    const { items, canvasSize } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    const newItem: TextItem = {
      id: generateId(),
      type: 'text',
      text,
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 20,
      scale: 1,
      rotation: 0,
      zIndex: maxZ + 1,
      style: { ...DEFAULT_TEXT_STYLE },
    };
    
    set(state => {
      const newItems = [...state.items, newItem];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: newItem.id,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  addShape: (x: number, y: number, width: number, height: number, shapeType: ShapeType) => {
    const { items, shapeStyle } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    const newItem: ShapeItem = {
      id: generateId(),
      type: 'shape',
      shapeType,
      x: Math.min(x, x + width),
      y: Math.min(y, y + height),
      width: Math.abs(width),
      height: Math.abs(height),
      scale: 1,
      rotation: 0,
      zIndex: maxZ + 1,
      style: { ...shapeStyle },
    };
    
    set(state => {
      const newItems = [...state.items, newItem];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: newItem.id,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  addBrush: (points: BrushPoint[], x: number, y: number, width: number, height: number) => {
    const { items, brushStyle } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    const newItem: BrushItem = {
      id: generateId(),
      type: 'brush',
      points,
      x,
      y,
      width,
      height,
      scale: 1,
      rotation: 0,
      zIndex: maxZ + 1,
      style: { ...brushStyle },
    };
    
    set(state => {
      const newItems = [...state.items, newItem];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: newItem.id,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  removeItem: (id: string) => {
    set(state => {
      const newItems = state.items.filter(e => e.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: state.selectedId === id ? null : state.selectedId,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  updateItem: (id: string, updates: Partial<CanvasItem>) => {
    set(state => ({
      items: state.items.map(e => 
        e.id === id ? { ...e, ...updates } as CanvasItem : e
      ),
    }));
  },

  updateTextStyle: (id: string, styleUpdates: Partial<TextStyle>) => {
    set(state => ({
      items: state.items.map(e => {
        if (e.id !== id || e.type !== 'text') return e;
        return {
          ...e,
          style: { ...e.style, ...styleUpdates },
        };
      }),
    }));
  },

  updateShapeStyle: (id: string, styleUpdates: Partial<ShapeStyle>) => {
    set(state => ({
      items: state.items.map(e => {
        if (e.id !== id || e.type !== 'shape') return e;
        return {
          ...e,
          style: { ...e.style, ...styleUpdates },
        };
      }),
    }));
  },

  updateBrushStyle: (id: string, styleUpdates: Partial<BrushStyle>) => {
    set(state => ({
      items: state.items.map(e => {
        if (e.id !== id || e.type !== 'brush') return e;
        return {
          ...e,
          style: { ...e.style, ...styleUpdates },
        };
      }),
    }));
  },

  selectItem: (id: string | null) => {
    set({ selectedId: id });
  },

  clearCanvas: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: [],
        selectedId: null,
        history: [...newHistory, []],
        historyIndex: newHistory.length,
      };
    });
  },

  undo: () => {
    set(state => {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        items: state.history[newIndex] || [],
        historyIndex: newIndex,
        selectedId: null,
      };
    });
  },

  redo: () => {
    set(state => {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        items: state.history[newIndex] || [],
        historyIndex: newIndex,
        selectedId: null,
      };
    });
  },

  bringForward: (id: string) => {
    set(state => {
      const sorted = [...state.items].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(e => e.id === id);
      if (index < 0 || index >= sorted.length - 1) return state;
      
      const next = sorted[index + 1];
      const currentZ = sorted[index].zIndex;
      const nextZ = next.zIndex;
      
      return {
        items: state.items.map(e => {
          if (e.id === id) return { ...e, zIndex: nextZ };
          if (e.id === next.id) return { ...e, zIndex: currentZ };
          return e;
        }),
      };
    });
  },

  sendBackward: (id: string) => {
    set(state => {
      const sorted = [...state.items].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(e => e.id === id);
      if (index <= 0) return state;
      
      const prev = sorted[index - 1];
      const currentZ = sorted[index].zIndex;
      const prevZ = prev.zIndex;
      
      return {
        items: state.items.map(e => {
          if (e.id === id) return { ...e, zIndex: prevZ };
          if (e.id === prev.id) return { ...e, zIndex: currentZ };
          return e;
        }),
      };
    });
  },

  bringToFront: (id: string) => {
    set(state => {
      const maxZ = Math.max(...state.items.map(e => e.zIndex), 0);
      return {
        items: state.items.map(e => 
          e.id === id ? { ...e, zIndex: maxZ + 1 } : e
        ),
      };
    });
  },

  sendToBack: (id: string) => {
    set(state => {
      const minZ = Math.min(...state.items.map(e => e.zIndex), 0);
      return {
        items: state.items.map(e => 
          e.id === id ? { ...e, zIndex: minZ - 1 } : e
        ),
      };
    });
  },

  saveToHistory: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        history: [...newHistory, [...state.items]],
        historyIndex: newHistory.length,
      };
    });
  },

  setBackground: (background: CanvasBackground) => {
    set({ background });
  },

  setBackgroundMode: (mode: BackgroundMode) => {
    const currentBg = get().background;
    let newBg: CanvasBackground;
    
    if (mode === 'solid') {
      newBg = {
        mode: 'solid',
        color: '#FFFFFF',
        opacity: currentBg.opacity ?? 1,
      };
    } else if (mode === 'gradient') {
      newBg = {
        mode: 'gradient',
        type: 'linear',
        angle: 135,
        opacity: currentBg.opacity ?? 1,
        colors: [
          { color: '#667eea', stop: 0 },
          { color: '#764ba2', stop: 1 },
        ],
      };
    } else {
      newBg = {
        mode: 'pattern',
        pattern: 'dots',
        color: '#A855F7',
        backgroundColor: '#F5F3FF',
        size: 20,
        opacity: currentBg.opacity ?? 1,
      };
    }
    
    set({ background: newBg });
  },

  updateSolidBackground: (updates: Partial<SolidBackground>) => {
    const state = get();
    if (state.background.mode !== 'solid') return;
    set({
      background: { ...state.background, ...updates },
    });
  },

  updateGradientBackground: (updates: Partial<GradientBackground>) => {
    const state = get();
    if (state.background.mode !== 'gradient') return;
    set({
      background: { ...state.background, ...updates },
    });
  },

  updatePatternBackground: (updates: Partial<PatternBackground>) => {
    const state = get();
    if (state.background.mode !== 'pattern') return;
    set({
      background: { ...state.background, ...updates },
    });
  },

  applyBackgroundPreset: (preset: BackgroundPreset) => {
    set({ background: { ...preset.background } });
  },

  setCurrentTool: (tool: DrawingTool) => {
    set({ currentTool: tool });
  },

  setShapeStyle: (style: Partial<ShapeStyle>) => {
    set(state => ({
      shapeStyle: { ...state.shapeStyle, ...style },
    }));
  },

  setBrushStyle: (style: Partial<BrushStyle>) => {
    set(state => ({
      brushStyle: { ...state.brushStyle, ...style },
    }));
  },

  setCanvasSize: (width: number, height: number) => {
    set({ canvasSize: { width, height } });
  },

  setItemAnimation: (id: string, animation: Partial<AnimationConfig>) => {
    set(state => ({
      items: state.items.map(e => {
        if (e.id !== id) return e;
        const currentAnim = e.animation || { ...DEFAULT_ANIMATION_CONFIG };
        return {
          ...e,
          animation: { ...currentAnim, ...animation },
        };
      }),
    }));
  },

  setAllItemsAnimation: (animation: Partial<AnimationConfig>) => {
    set(state => ({
      items: state.items.map(e => {
        const currentAnim = e.animation || { ...DEFAULT_ANIMATION_CONFIG };
        return {
          ...e,
          animation: { ...currentAnim, ...animation },
        };
      }),
    }));
  },

  updateAnimationSettings: (settings: Partial<AnimationSettings>) => {
    set(state => ({
      animationSettings: { ...state.animationSettings, ...settings },
    }));
  },

  playAnimation: () => {
    set(state => ({
      animationSettings: { ...state.animationSettings, isPlaying: true },
    }));
  },

  pauseAnimation: () => {
    set(state => ({
      animationSettings: { ...state.animationSettings, isPlaying: false },
    }));
  },

  setCurrentFrame: (frame: number | ((prev: number) => number)) => {
    set(state => {
      const newFrame = typeof frame === 'function' ? frame(state.animationSettings.currentFrame) : frame;
      return {
        animationSettings: { ...state.animationSettings, currentFrame: newFrame },
      };
    });
  },

  generateMosaic: (options: MosaicGeneratorOptions): string => {
    const mosaicId = generateId();
    const { colorCategory, cellSize, style, emojiScale, rotationVariation, offsetVariation, locked, clearBeforeGenerate } = options;
    const { canvasSize } = get();
    
    const colorEmojis: Record<string, string[]> = {
      rainbow: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🤍', '🖤'],
      warm: ['❤️', '🧡', '💛', '🤎', '🩷', '🧡', '❤️‍🔥', '🍊'],
      cool: ['💙', '💚', '💜', '🩵', '🤍', '🩶', '💎', '🌊'],
      pastel: ['🩷', '🩵', '💛', '💚', '💜', '🤍', '🌸', '🦄'],
      neon: ['💚', '💙', '💛', '💜', '🧡', '❤️', '✨', '💫'],
      nature: ['💚', '🤎', '💛', '🌿', '🍃', '🌻', '🌷', '🌺'],
      candy: ['🩷', '💜', '💙', '💛', '🧡', '🤍', '🍬', '🍭'],
      sunset: ['❤️', '🧡', '💛', '💜', '💗', '🌅', '🔥', '✨'],
    };
    
    const emojis = colorEmojis[colorCategory] || colorEmojis.rainbow;
    
    const newItems: CanvasItem[] = [];
    const cols = Math.floor(canvasSize.width / cellSize);
    const rows = Math.floor(canvasSize.height / cellSize);
    const offsetX = (canvasSize.width - cols * cellSize) / 2;
    const offsetY = (canvasSize.height - rows * cellSize) / 2;
    
    let zIndex = 1;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const centerX = offsetX + col * cellSize + cellSize / 2;
        const centerY = offsetY + row * cellSize + cellSize / 2;
        
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        let scale = emojiScale * (cellSize / 40);
        let rotation = 0;
        let xOffset = 0;
        let yOffset = 0;
        
        if (style === 'random') {
          scale *= (0.7 + Math.random() * 0.6);
          rotation = (Math.random() - 0.5) * 360 * rotationVariation;
          xOffset = (Math.random() - 0.5) * cellSize * offsetVariation;
          yOffset = (Math.random() - 0.5) * cellSize * offsetVariation;
        } else if (style === 'mosaic') {
          const isEdge = row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
          if (isEdge) {
            scale *= 0.8;
          }
        }
        
        const size = cellSize * scale;
        
        newItems.push({
          id: generateId(),
          type: 'emoji',
          emoji,
          x: centerX - size / 2 + xOffset,
          y: centerY - size / 2 + yOffset,
          scale: scale,
          rotation,
          zIndex: zIndex++,
          locked,
          mosaicId,
        });
      }
    }
    
    set(state => {
      const baseItems = clearBeforeGenerate ? [] : state.items;
      const newItemsWithZ = newItems.map((item, idx) => ({
        ...item,
        zIndex: (baseItems.length > 0 ? Math.max(...baseItems.map(e => e.zIndex)) : 0) + idx + 1,
      }));
      const finalItems = [...baseItems, ...newItemsWithZ];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      
      return {
        items: finalItems,
        history: [...newHistory, finalItems],
        historyIndex: newHistory.length,
      };
    });
    
    return mosaicId;
  },

  unlockMosaicGroup: (mosaicId: string) => {
    set(state => ({
      items: state.items.map(e => 
        e.mosaicId === mosaicId ? { ...e, locked: false } : e
      ),
    }));
  },

  removeMosaicGroup: (mosaicId: string) => {
    set(state => {
      const newItems = state.items.filter(e => e.mosaicId !== mosaicId);
      return {
        items: newItems,
      };
    });
  },

  findMosaicIdByItemId: (itemId: string): string | null => {
    const item = get().items.find(e => e.id === itemId);
    return item?.mosaicId || null;
  },

  toggleStoryMode: () => {
    set(state => {
      const newIsStoryMode = !state.isStoryMode;
      if (newIsStoryMode && state.frames.length === 0) {
        const firstFrame: StoryFrame = {
          id: generateId(),
          title: '第1格',
          items: [...state.items],
          background: { ...state.background },
          border: { ...DEFAULT_FRAME_BORDER },
          speechBubbles: [],
          order: 0,
        };
        return {
          isStoryMode: newIsStoryMode,
          frames: [firstFrame],
          currentFrameId: firstFrame.id,
        };
      }
      return { isStoryMode: newIsStoryMode };
    });
  },

  setStoryMode: (enabled: boolean) => {
    set(state => {
      if (enabled && state.frames.length === 0) {
        const firstFrame: StoryFrame = {
          id: generateId(),
          title: '第1格',
          items: [...state.items],
          background: { ...state.background },
          border: { ...DEFAULT_FRAME_BORDER },
          speechBubbles: [],
          order: 0,
        };
        return {
          isStoryMode: enabled,
          frames: [firstFrame],
          currentFrameId: firstFrame.id,
        };
      }
      return { isStoryMode: enabled };
    });
  },

  addStoryFrame: () => {
    set(state => {
      const newOrder = state.frames.length;
      const newFrame: StoryFrame = {
        id: generateId(),
        title: `第${newOrder + 1}格`,
        items: [],
        background: { ...DEFAULT_BACKGROUND },
        border: { ...DEFAULT_FRAME_BORDER },
        speechBubbles: [],
        order: newOrder,
      };
      const newFrames = [...state.frames, newFrame];
      return {
        frames: newFrames,
        currentFrameId: newFrame.id,
        items: [],
        background: { ...DEFAULT_BACKGROUND },
        history: [[]],
        historyIndex: 0,
      };
    });
  },

  removeStoryFrame: (frameId: string) => {
    set(state => {
      const newFrames = state.frames.filter(f => f.id !== frameId)
        .map((f, idx) => ({ ...f, order: idx, title: `第${idx + 1}格` }));
      const newCurrentId = state.currentFrameId === frameId
        ? (newFrames.length > 0 ? newFrames[0].id : null)
        : state.currentFrameId;
      const currentFrame = newFrames.find(f => f.id === newCurrentId);
      return {
        frames: newFrames,
        currentFrameId: newCurrentId,
        items: currentFrame ? currentFrame.items : [],
        background: currentFrame ? currentFrame.background : DEFAULT_BACKGROUND,
        history: currentFrame ? [currentFrame.items] : [[]],
        historyIndex: 0,
      };
    });
  },

  duplicateStoryFrame: (frameId: string) => {
    set(state => {
      const frame = state.frames.find(f => f.id === frameId);
      if (!frame) return state;
      const newOrder = state.frames.length;
      const newFrame: StoryFrame = {
        ...frame,
        id: generateId(),
        title: `${frame.title} 副本`,
        order: newOrder,
        items: frame.items.map(item => ({ ...item, id: generateId() })),
        speechBubbles: frame.speechBubbles.map(b => ({ ...b, id: generateId() })),
      };
      const newFrames = [...state.frames, newFrame];
      return {
        frames: newFrames,
        currentFrameId: newFrame.id,
        items: newFrame.items,
        background: newFrame.background,
        history: [newFrame.items],
        historyIndex: 0,
      };
    });
  },

  setCurrentStoryFrame: (frameId: string) => {
    set(state => {
      const frame = state.frames.find(f => f.id === frameId);
      if (!frame) return state;
      return {
        currentFrameId: frameId,
        items: [...frame.items],
        background: { ...frame.background },
        history: [frame.items],
        historyIndex: 0,
      };
    });
  },

  reorderStoryFrames: (fromIndex: number, toIndex: number) => {
    set(state => {
      const sorted = [...state.frames].sort((a, b) => a.order - b.order);
      const [removed] = sorted.splice(fromIndex, 1);
      sorted.splice(toIndex, 0, removed);
      const newFrames = sorted.map((f, idx) => ({ ...f, order: idx, title: `第${idx + 1}格` }));
      return { frames: newFrames };
    });
  },

  updateStoryFrame: (frameId: string, updates: Partial<StoryFrame>) => {
    set(state => ({
      frames: state.frames.map(f =>
        f.id === frameId ? { ...f, ...updates } : f
      ),
    }));
  },

  setStoryTitle: (title: string) => {
    set({ storyTitle: title });
  },

  toggleShowStoryTitle: () => {
    set(state => ({ showStoryTitle: !state.showStoryTitle }));
  },

  updateStoryTitleStyle: (updates: Partial<StoryBoardState['storyTitleStyle']>) => {
    set(state => ({
      storyTitleStyle: { ...state.storyTitleStyle, ...updates },
    }));
  },

  updateFrameBorder: (frameId: string, border: Partial<FrameBorderConfig>) => {
    set(state => ({
      frames: state.frames.map(f =>
        f.id === frameId ? { ...f, border: { ...f.border, ...border } } : f
      ),
    }));
  },

  addSpeechBubble: (frameId: string, bubble: Omit<SpeechBubble, 'id'>) => {
    set(state => ({
      frames: state.frames.map(f =>
        f.id === frameId
          ? { ...f, speechBubbles: [...f.speechBubbles, { ...bubble, id: generateId() }] }
          : f
      ),
    }));
  },

  updateSpeechBubble: (frameId: string, bubbleId: string, updates: Partial<SpeechBubble>) => {
    set(state => ({
      frames: state.frames.map(f =>
        f.id === frameId
          ? {
              ...f,
              speechBubbles: f.speechBubbles.map(b =>
                b.id === bubbleId ? { ...b, ...updates } : b
              ),
            }
          : f
      ),
    }));
  },

  removeSpeechBubble: (frameId: string, bubbleId: string) => {
    set(state => ({
      frames: state.frames.map(f =>
        f.id === frameId
          ? { ...f, speechBubbles: f.speechBubbles.filter(b => b.id !== bubbleId) }
          : f
      ),
    }));
  },

  saveCurrentFrameToStory: () => {
    const { currentFrameId, items, background, frames } = get();
    if (!currentFrameId) return;
    set({
      frames: frames.map(f =>
        f.id === currentFrameId ? { ...f, items: [...items], background: { ...background } } : f
      ),
    });
  },

  loadStoryFrameToCanvas: (frameId: string) => {
    const frame = get().frames.find(f => f.id === frameId);
    if (!frame) return;
    set({
      currentFrameId: frameId,
      items: [...frame.items],
      background: { ...frame.background },
      history: [frame.items],
      historyIndex: 0,
    });
  },
}));
