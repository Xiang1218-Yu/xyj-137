import { create } from 'zustand';

export interface EmojiItem {
  id: string;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
}

interface CanvasState {
  emojis: EmojiItem[];
  selectedId: string | null;
  history: EmojiItem[][];
  historyIndex: number;
  canvasSize: { width: number; height: number };
  
  addEmoji: (emoji: string) => void;
  removeEmoji: (id: string) => void;
  updateEmoji: (id: string, updates: Partial<EmojiItem>) => void;
  selectEmoji: (id: string | null) => void;
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
  emojis: [],
  selectedId: null,
  history: [[]],
  historyIndex: 0,
  canvasSize: { width: 400, height: 400 },

  addEmoji: (emoji: string) => {
    const { emojis, canvasSize } = get();
    const maxZ = emojis.length > 0 ? Math.max(...emojis.map(e => e.zIndex)) : 0;
    const newEmoji: EmojiItem = {
      id: generateId(),
      emoji,
      x: canvasSize.width / 2 - 40,
      y: canvasSize.height / 2 - 40,
      scale: 1,
      rotation: 0,
      zIndex: maxZ + 1,
    };
    
    set(state => {
      const newEmojis = [...state.emojis, newEmoji];
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        emojis: newEmojis,
        selectedId: newEmoji.id,
        history: [...newHistory, newEmojis],
        historyIndex: newHistory.length,
      };
    });
  },

  removeEmoji: (id: string) => {
    set(state => {
      const newEmojis = state.emojis.filter(e => e.id !== id);
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        emojis: newEmojis,
        selectedId: state.selectedId === id ? null : state.selectedId,
        history: [...newHistory, newEmojis],
        historyIndex: newHistory.length,
      };
    });
  },

  updateEmoji: (id: string, updates: Partial<EmojiItem>) => {
    set(state => ({
      emojis: state.emojis.map(e => 
        e.id === id ? { ...e, ...updates } : e
      ),
    }));
  },

  selectEmoji: (id: string | null) => {
    set({ selectedId: id });
  },

  clearCanvas: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        emojis: [],
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
        emojis: state.history[newIndex] || [],
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
        emojis: state.history[newIndex] || [],
        historyIndex: newIndex,
        selectedId: null,
      };
    });
  },

  bringForward: (id: string) => {
    set(state => {
      const sorted = [...state.emojis].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(e => e.id === id);
      if (index < 0 || index >= sorted.length - 1) return state;
      
      const next = sorted[index + 1];
      const currentZ = sorted[index].zIndex;
      const nextZ = next.zIndex;
      
      return {
        emojis: state.emojis.map(e => {
          if (e.id === id) return { ...e, zIndex: nextZ };
          if (e.id === next.id) return { ...e, zIndex: currentZ };
          return e;
        }),
      };
    });
  },

  sendBackward: (id: string) => {
    set(state => {
      const sorted = [...state.emojis].sort((a, b) => a.zIndex - b.zIndex);
      const index = sorted.findIndex(e => e.id === id);
      if (index <= 0) return state;
      
      const prev = sorted[index - 1];
      const currentZ = sorted[index].zIndex;
      const prevZ = prev.zIndex;
      
      return {
        emojis: state.emojis.map(e => {
          if (e.id === id) return { ...e, zIndex: prevZ };
          if (e.id === prev.id) return { ...e, zIndex: currentZ };
          return e;
        }),
      };
    });
  },

  bringToFront: (id: string) => {
    set(state => {
      const maxZ = Math.max(...state.emojis.map(e => e.zIndex), 0);
      return {
        emojis: state.emojis.map(e => 
          e.id === id ? { ...e, zIndex: maxZ + 1 } : e
        ),
      };
    });
  },

  sendToBack: (id: string) => {
    set(state => {
      const minZ = Math.min(...state.emojis.map(e => e.zIndex), 0);
      return {
        emojis: state.emojis.map(e => 
          e.id === id ? { ...e, zIndex: minZ - 1 } : e
        ),
      };
    });
  },

  saveToHistory: () => {
    set(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      return {
        history: [...newHistory, [...state.emojis]],
        historyIndex: newHistory.length,
      };
    });
  },
}));
