import { create } from 'zustand';
import { generateMosaicEmojis } from '@/utils/mosaicGenerator';
import type { ShapeType as MosaicShapeType } from '@/utils/shapeTemplates';
import type { ColorCategory, MosaicStyle } from '@/utils/mosaicGenerator';

export type CanvasItemType = 'emoji' | 'text' | 'shape' | 'brush';
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'line' | 'ellipse' | 'star';
export type DrawingTool = 'select' | 'rectangle' | 'circle' | 'triangle' | 'line' | 'ellipse' | 'star' | 'brush';
export type BackgroundMode = 'solid' | 'gradient' | 'pattern';
export type PatternType = 'dots' | 'grid' | 'lines' | 'diagonal' | 'waves' | 'zigzag';

export type AnimationPreset = 'none' | 'rotate' | 'bounce' | 'shake' | 'appear' | 'pulse' | 'swing' | 'float';
export type AnimationExportFormat = 'gif' | 'apng';

export interface AnimationConfig {
  preset: AnimationPreset;
  speed: number;
  intensity: number;
  delay: number;
  loop: boolean;
}

export const DEFAULT_ANIMATION_CONFIG: AnimationConfig = {
  preset: 'none',
  speed: 1,
  intensity: 1,
  delay: 0,
  loop: true,
};

export const ANIMATION_PRESETS: { id: AnimationPreset; name: string; icon: string; description: string }[] = [
  { id: 'none', name: '无动画', icon: '⏹️', description: '静态显示' },
  { id: 'rotate', name: '旋转', icon: '🔄', description: '持续旋转' },
  { id: 'bounce', name: '跳动', icon: '⬆️', description: '上下跳动' },
  { id: 'shake', name: '抖动', icon: '📳', description: '左右抖动' },
  { id: 'appear', name: '出现', icon: '✨', description: '淡入放大出现' },
  { id: 'pulse', name: '脉冲', icon: '💗', description: '缩放脉冲' },
  { id: 'swing', name: '摇摆', icon: '🎐', description: '左右摇摆' },
  { id: 'float', name: '漂浮', icon: '🎈', description: '上下漂浮' },
];

export interface AnimationSettings {
  frameCount: number;
  frameDelay: number;
  format: AnimationExportFormat;
  quality: number;
  isPlaying: boolean;
  currentFrame: number;
}

export const DEFAULT_ANIMATION_SETTINGS: AnimationSettings = {
  frameCount: 30,
  frameDelay: 50,
  format: 'gif',
  quality: 10,
  isPlaying: false,
  currentFrame: 0,
};

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

export interface BrushPoint {
  x: number;
  y: number;
  pressure: number;
}

export interface BrushStyle {
  color: string;
  strokeWidth: number;
  opacity: number;
  smoothness: number;
}

export interface BrushItem extends BaseCanvasItem {
  type: 'brush';
  points: BrushPoint[];
  style: BrushStyle;
}

export type CanvasItem = EmojiItem | TextItem | ShapeItem | BrushItem;

export const DEFAULT_SHAPE_STYLE: ShapeStyle = {
  fill: '#6366F1',
  stroke: '#4F46E5',
  strokeWidth: 2,
  borderRadius: 0,
  opacity: 1,
};

export const DEFAULT_BRUSH_STYLE: BrushStyle = {
  color: '#333333',
  strokeWidth: 3,
  opacity: 1,
  smoothness: 0.5,
};

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

interface CanvasState {
  items: CanvasItem[];
  selectedId: string | null;
  history: CanvasItem[][];
  historyIndex: number;
  canvasSize: { width: number; height: number };
  background: CanvasBackground;
  animationSettings: AnimationSettings;
  currentTool: DrawingTool;
  shapeStyle: ShapeStyle;
  brushStyle: BrushStyle;
  
  addEmoji: (emoji: string) => void;
  addText: (text?: string) => void;
  addShape: (shapeType: ShapeType, x: number, y: number, width: number, height: number) => void;
  addBrush: (points: BrushPoint[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  updateTextStyle: (id: string, styleUpdates: Partial<TextStyle>) => void;
  updateShapeStyle: (id: string, styleUpdates: Partial<ShapeStyle>) => void;
  updateBrushStyle: (id: string, styleUpdates: Partial<BrushStyle>) => void;
  selectItem: (id: string | null) => void;
  setCurrentTool: (tool: DrawingTool) => void;
  setShapeStyle: (style: Partial<ShapeStyle>) => void;
  setBrushStyle: (style: Partial<BrushStyle>) => void;
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
  generateMosaic: (options: {
    shape: MosaicShapeType;
    colorCategory: ColorCategory;
    cellSize: number;
    style: MosaicStyle;
    emojiScale?: number;
    rotationVariation?: number;
    offsetVariation?: number;
    locked?: boolean;
    clearBeforeGenerate?: boolean;
  }) => string;
  unlockMosaicGroup: (mosaicId: string) => void;
  removeMosaicGroup: (mosaicId: string) => void;
  findMosaicIdByItemId: (itemId: string) => string | null;
  setItemAnimation: (id: string, animation: Partial<AnimationConfig>) => void;
  setAllItemsAnimation: (animation: Partial<AnimationConfig>) => void;
  updateAnimationSettings: (settings: Partial<AnimationSettings>) => void;
  playAnimation: () => void;
  pauseAnimation: () => void;
  setCurrentFrame: (frame: number | ((prev: number) => number)) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useCanvasStore = create<CanvasState>((set, get) => ({
  items: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  canvasSize: { width: 400, height: 400 },
  background: DEFAULT_BACKGROUND,
  animationSettings: { ...DEFAULT_ANIMATION_SETTINGS },
  currentTool: 'select',
  shapeStyle: { ...DEFAULT_SHAPE_STYLE },
  brushStyle: { ...DEFAULT_BRUSH_STYLE },

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

  addShape: (shapeType: ShapeType, x: number, y: number, width: number, height: number) => {
    const { items, shapeStyle } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    const newItem: ShapeItem = {
      id: generateId(),
      type: 'shape',
      shapeType,
      x,
      y,
      width,
      height,
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

  addBrush: (points: BrushPoint[]) => {
    if (points.length < 2) return;
    
    const { items, brushStyle } = get();
    const maxZ = items.length > 0 ? Math.max(...items.map(e => e.zIndex)) : 0;
    
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    
    const adjustedPoints = points.map(p => ({
      x: p.x - minX,
      y: p.y - minY,
      pressure: p.pressure,
    }));
    
    const newItem: BrushItem = {
      id: generateId(),
      type: 'brush',
      points: adjustedPoints,
      x: minX,
      y: minY,
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

  setCurrentTool: (tool: DrawingTool) => {
    set({ currentTool: tool, selectedId: null });
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

  generateMosaic: (options) => {
    const { canvasSize } = get();
    const mosaicId = generateId();
    const locked = options.locked ?? true;
    const clearBeforeGenerate = options.clearBeforeGenerate ?? false;

    const mosaicItems = generateMosaicEmojis({
      ...options,
      canvasWidth: canvasSize.width,
      canvasHeight: canvasSize.height,
    });

    set(state => {
      const baseItems = clearBeforeGenerate ? [] : state.items;
      const maxZ = baseItems.length > 0 ? Math.max(...baseItems.map(e => e.zIndex)) : 0;
      const adjustedItems = mosaicItems.map((item, index) => ({
        ...item,
        zIndex: maxZ + 1 + index,
        locked,
        mosaicId,
      }));
      
      const newItems = [...baseItems, ...adjustedItems];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      
      return {
        items: newItems,
        selectedId: null,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });

    return mosaicId;
  },

  unlockMosaicGroup: (mosaicId) => {
    set(state => ({
      items: state.items.map(e => 
        e.mosaicId === mosaicId ? { ...e, locked: false } : e
      ),
    }));
    get().saveToHistory();
  },

  removeMosaicGroup: (mosaicId) => {
    set(state => {
      const newItems = state.items.filter(e => e.mosaicId !== mosaicId);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        items: newItems,
        selectedId: state.selectedId && state.items.find(e => e.id === state.selectedId)?.mosaicId === mosaicId 
          ? null 
          : state.selectedId,
        history: [...newHistory, newItems],
        historyIndex: newHistory.length,
      };
    });
  },

  findMosaicIdByItemId: (itemId) => {
    const item = get().items.find(e => e.id === itemId);
    return item?.mosaicId || null;
  },

  setItemAnimation: (id, animation) => {
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
    get().saveToHistory();
  },

  setAllItemsAnimation: (animation) => {
    set(state => ({
      items: state.items.map(e => {
        const currentAnim = e.animation || { ...DEFAULT_ANIMATION_CONFIG };
        return {
          ...e,
          animation: { ...currentAnim, ...animation },
        };
      }),
    }));
    get().saveToHistory();
  },

  updateAnimationSettings: (settings) => {
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

  setCurrentFrame: (frame) => {
    set(state => ({
      animationSettings: {
        ...state.animationSettings,
        currentFrame: typeof frame === 'function' ? frame(state.animationSettings.currentFrame) : frame,
      },
    }));
  },
}));
