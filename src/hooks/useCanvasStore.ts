import { create } from 'zustand';

export type CanvasItemType = 'emoji' | 'text';

export interface BaseCanvasItem {
  id: string;
  type: CanvasItemType;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
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

export type CanvasItem = EmojiItem | TextItem;

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

interface CanvasState {
  items: CanvasItem[];
  selectedId: string | null;
  history: CanvasItem[][];
  historyIndex: number;
  canvasSize: { width: number; height: number };
  
  addEmoji: (emoji: string) => void;
  addText: (text?: string) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<CanvasItem>) => void;
  updateTextStyle: (id: string, styleUpdates: Partial<TextStyle>) => void;
  selectItem: (id: string | null) => void;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  saveToHistory: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useCanvasStore = create<CanvasState>((set, get) => ({
  items: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  canvasSize: { width: 400, height: 400 },

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
}));
