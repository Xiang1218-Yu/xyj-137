import { emojiCategories } from './emojiData';
import type { ShapeType } from './shapeTemplates';
import { generateShapeMask, getShapeBoundingBox } from './shapeTemplates';
import type { EmojiItem } from '@/hooks/useCanvasStore';

export type MosaicStyle = 'pixel' | 'mosaic' | 'random';

export type ColorCategory = 
  | 'red' 
  | 'orange' 
  | 'yellow' 
  | 'green' 
  | 'blue' 
  | 'purple' 
  | 'pink' 
  | 'brown' 
  | 'white' 
  | 'black'
  | 'rainbow'
  | 'all';

export interface ColorCategoryInfo {
  id: ColorCategory;
  name: string;
  color: string;
  emojis: string[];
}

const RED_EMOJIS = ['❤️', '🧡', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '🔴', '🟥', '🍎', '🍓', '🍒', '🌹', '🌶️', '🔥', '💥', '💢', '❤️‍🔥'];
const ORANGE_EMOJIS = ['🧡', '🟧', '🍊', '🍑', '🥭', '🍁', '🦊', '🐯', '🦁', '🔶', '🟠', '🎃', '🧀', '🥐', '🔥'];
const YELLOW_EMOJIS = ['💛', '🟨', '⭐', '🌟', '✨', '💫', '⚡', '🔆', '☀️', '🌞', '🌻', '🌼', '🍋', '🍌', '🍍', '🥚', '🧈', '💰', '💵', '🏆', '🥇', '🪙'];
const GREEN_EMOJIS = ['💚', '🟩', '🟢', '🍀', '🌿', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🥒', '🥦', '🥬', '🫑', '🍏', '🍐', '🥝', '🐸', '🦖', '🦎', '🐢', '💚'];
const BLUE_EMOJIS = ['💙', '🟦', '🔵', '🌊', '💧', '💦', '🫐', '🍇', '🐳', '🐬', '🦋', '🐦', '💎', '🌌', '🌀', '🧊', '🥶'];
const PURPLE_EMOJIS = ['💜', '🟪', '🟣', '🍇', '🔮', '💜', '🦄', '🐙', '🍆', '☂️', '🎆', '🌌', '🔮', '💎'];
const PINK_EMOJIS = ['💗', '💖', '💘', '💝', '💞', '💕', '🌸', '🌺', '🌷', '🌹', '💮', '🎀', '👛', '🐷', '🐽', '🧁', '🍬', '🍭', '🍩', '🎂', '💓'];
const BROWN_EMOJIS = ['🤎', '🟤', '🍫', '🍩', '🍪', '🧁', '🥥', '🥔', '🍠', '🐻', '🐨', '🦌', '🐶', '🐱', '🦊', '🐻‍❄️', '🪵', '📻'];
const WHITE_EMOJIS = ['🤍', '⬜', '⚪', '☁️', '🌨️', '❄️', '⛄', '🥚', '🧻', '🕊️', '🦢', '🐻‍❄️', '🐏', '🐑', '🍚', '🍙', '🥛', '💎', '✨'];
const BLACK_EMOJIS = ['🖤', '⬛', '⚫', '🌑', '🌚', '🌑', '🕶️', '🎱', '♠️', '♣️', '🐧', '🐦‍⬛', '🦇', '💣', '🔪', '🖤'];

const RAINBOW_EMOJIS = [
  '❤️', '🧡', '💛', '💚', '💙', '💜',
  '🌈', '⭐', '✨', '💫', '⚡', '🔥',
  '🌸', '🌺', '🌻', '🌷', '🌹', '🍀',
  '🍎', '🍊', '🍋', '🍇', '🍓', '🫐',
  '🎀', '💎', '🔮', '🎆', '✨', '💖',
];

const ALL_EMOJIS = emojiCategories.flatMap(cat => cat.emojis);

export const COLOR_CATEGORIES: ColorCategoryInfo[] = [
  { id: 'red', name: '红色系', color: '#EF4444', emojis: RED_EMOJIS },
  { id: 'orange', name: '橙色系', color: '#F97316', emojis: ORANGE_EMOJIS },
  { id: 'yellow', name: '黄色系', color: '#EAB308', emojis: YELLOW_EMOJIS },
  { id: 'green', name: '绿色系', color: '#22C55E', emojis: GREEN_EMOJIS },
  { id: 'blue', name: '蓝色系', color: '#3B82F6', emojis: BLUE_EMOJIS },
  { id: 'purple', name: '紫色系', color: '#A855F7', emojis: PURPLE_EMOJIS },
  { id: 'pink', name: '粉色系', color: '#EC4899', emojis: PINK_EMOJIS },
  { id: 'brown', name: '棕色系', color: '#92400E', emojis: BROWN_EMOJIS },
  { id: 'white', name: '白色系', color: '#F3F4F6', emojis: WHITE_EMOJIS },
  { id: 'black', name: '黑色系', color: '#1F2937', emojis: BLACK_EMOJIS },
  { id: 'rainbow', name: '彩虹色', color: 'linear-gradient(90deg, #EF4444, #F97316, #EAB308, #22C55E, #3B82F6, #A855F7)', emojis: RAINBOW_EMOJIS },
  { id: 'all', name: '全部表情', color: 'linear-gradient(135deg, #F472B6, #A78BFA, #60A5FA)', emojis: ALL_EMOJIS },
];

export function getEmojisByCategory(categoryId: ColorCategory): string[] {
  const category = COLOR_CATEGORIES.find(c => c.id === categoryId);
  return category ? category.emojis : ALL_EMOJIS;
}

export function getRandomEmoji(emojis: string[], seed?: number): string {
  if (emojis.length === 0) return '✨';
  const index = seed !== undefined
    ? Math.floor(Math.abs(Math.sin(seed) * emojis.length))
    : Math.floor(Math.random() * emojis.length);
  return emojis[index];
}

export interface MosaicGenerateOptions {
  shape: ShapeType;
  colorCategory: ColorCategory;
  cellSize: number;
  style: MosaicStyle;
  canvasWidth: number;
  canvasHeight: number;
  emojiScale?: number;
  rotationVariation?: number;
  offsetVariation?: number;
  coreEmojis?: string[];
  edgeEmojis?: string[];
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export function generateMosaicEmojis(options: MosaicGenerateOptions): EmojiItem[] {
  const {
    shape,
    colorCategory,
    cellSize,
    style,
    canvasWidth,
    canvasHeight,
    emojiScale = 0.9,
    rotationVariation = 0,
    offsetVariation = 0,
  } = options;

  const gridSize = Math.floor(Math.min(canvasWidth, canvasHeight) / cellSize);
  const mask = generateShapeMask(shape, gridSize, cellSize);
  const bbox = getShapeBoundingBox(shape, gridSize);

  const shapeWidth = (bbox.maxX - bbox.minX + 1) * cellSize;
  const shapeHeight = (bbox.maxY - bbox.minY + 1) * cellSize;
  const offsetX = (canvasWidth - shapeWidth) / 2 - bbox.minX * cellSize;
  const offsetY = (canvasHeight - shapeHeight) / 2 - bbox.minY * cellSize;

  const primaryEmojis = getEmojisByCategory(colorCategory);
  let edgeEmojis = options.edgeEmojis || [];
  let coreEmojis = options.coreEmojis || [];

  if (edgeEmojis.length === 0) {
    edgeEmojis = primaryEmojis;
  }
  if (coreEmojis.length === 0) {
    coreEmojis = primaryEmojis;
  }

  const items: EmojiItem[] = [];
  let zIndex = 1;

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const cell = mask[row][col];
      if (!cell.inside) continue;

      let emojiPool = primaryEmojis;
      let scale = emojiScale;

      if (style === 'pixel') {
        scale = emojiScale;
        emojiPool = coreEmojis;
      } else if (style === 'mosaic') {
        if (cell.region === 'edge') {
          emojiPool = edgeEmojis;
          scale = emojiScale * 0.8;
        } else {
          emojiPool = coreEmojis;
        }
      } else if (style === 'random') {
        scale = emojiScale * (0.7 + Math.random() * 0.6);
      }

      const emoji = getRandomEmoji(emojiPool, style === 'pixel' ? row * gridSize + col : undefined);

      let x = cell.x + offsetX;
      let y = cell.y + offsetY;

      if (offsetVariation > 0) {
        x += (Math.random() - 0.5) * offsetVariation * cellSize;
        y += (Math.random() - 0.5) * offsetVariation * cellSize;
      }

      let rotation = 0;
      if (rotationVariation > 0) {
        rotation = (Math.random() - 0.5) * rotationVariation * 2;
      }

      const emojiSize = cellSize * scale;
      const emojiX = x + (cellSize - emojiSize) / 2;
      const emojiY = y + (cellSize - emojiSize) / 2;

      const item: EmojiItem = {
        id: generateId(),
        type: 'emoji',
        emoji,
        x: emojiX,
        y: emojiY,
        scale: (emojiSize / 80) * scale,
        rotation,
        zIndex: zIndex++,
      };

      items.push(item);
    }
  }

  return items;
}

export function estimateEmojiCount(shape: ShapeType, cellSize: number, canvasWidth: number, canvasHeight: number): number {
  const gridSize = Math.floor(Math.min(canvasWidth, canvasHeight) / cellSize);
  const mask = generateShapeMask(shape, gridSize, cellSize);
  
  let count = 0;
  for (const row of mask) {
    for (const cell of row) {
      if (cell.inside) count++;
    }
  }
  return count;
}
