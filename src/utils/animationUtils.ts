import type { CanvasItem, EmojiItem, TextItem, AnimationConfig } from '@/hooks/useCanvasStore';
import { DEFAULT_ANIMATION_CONFIG } from '@/hooks/useCanvasStore';

export interface FrameTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

export interface AnimatedItem {
  item: CanvasItem;
  transform: FrameTransform;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function calculateFrameTransform(
  item: CanvasItem,
  frameIndex: number,
  totalFrames: number
): FrameTransform {
  const anim: AnimationConfig = item.animation || { ...DEFAULT_ANIMATION_CONFIG };
  
  if (anim.preset === 'none') {
    return {
      x: item.x,
      y: item.y,
      scale: item.scale,
      rotation: item.rotation,
      opacity: 1,
    };
  }

  const adjustedFrame = Math.max(0, frameIndex - anim.delay);
  const effectiveFrames = Math.max(1, totalFrames - anim.delay);
  
  if (adjustedFrame < 0) {
    return {
      x: item.x,
      y: item.y,
      scale: item.scale,
      rotation: item.rotation,
      opacity: 0,
    };
  }

  let progress = anim.loop
    ? (adjustedFrame % effectiveFrames) / effectiveFrames
    : Math.min(1, adjustedFrame / effectiveFrames);

  progress *= anim.speed;
  if (progress > 1 && anim.loop) {
    progress = progress - Math.floor(progress);
  }
  progress = Math.min(1, progress);

  const intensity = anim.intensity;
  const baseTransform: FrameTransform = {
    x: item.x,
    y: item.y,
    scale: item.scale,
    rotation: item.rotation,
    opacity: 1,
  };

  switch (anim.preset) {
    case 'rotate': {
      const angle = progress * 360 * intensity;
      return { ...baseTransform, rotation: item.rotation + angle };
    }

    case 'bounce': {
      const bounceHeight = 40 * intensity;
      const bounceProgress = Math.sin(progress * Math.PI * 2);
      const offsetY = -Math.abs(bounceProgress) * bounceHeight;
      return { ...baseTransform, y: item.y + offsetY };
    }

    case 'shake': {
      const shakeAmount = 10 * intensity;
      const shakeProgress = Math.sin(progress * Math.PI * 8);
      const offsetX = shakeProgress * shakeAmount;
      return { ...baseTransform, x: item.x + offsetX };
    }

    case 'appear': {
      const appearProgress = easeOutBack(Math.min(1, progress * 1.5));
      const scale = item.scale * appearProgress;
      const opacity = Math.min(1, progress * 2);
      return { ...baseTransform, scale, opacity };
    }

    case 'pulse': {
      const pulseProgress = Math.sin(progress * Math.PI * 2);
      const scale = item.scale * (1 + pulseProgress * 0.2 * intensity);
      return { ...baseTransform, scale };
    }

    case 'swing': {
      const swingAngle = 15 * intensity;
      const swingProgress = Math.sin(progress * Math.PI * 2);
      return { ...baseTransform, rotation: item.rotation + swingProgress * swingAngle };
    }

    case 'float': {
      const floatHeight = 20 * intensity;
      const floatProgress = Math.sin(progress * Math.PI * 2);
      const offsetY = floatProgress * floatHeight;
      const floatX = Math.cos(progress * Math.PI * 2) * 5 * intensity;
      return { ...baseTransform, x: item.x + floatX, y: item.y + offsetY };
    }

    default:
      return baseTransform;
  }
}

export function generateAnimatedItems(
  items: CanvasItem[],
  frameIndex: number,
  totalFrames: number
): AnimatedItem[] {
  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);
  return sortedItems.map(item => ({
    item,
    transform: calculateFrameTransform(item, frameIndex, totalFrames),
  }));
}

export function renderFrameToCanvas(
  ctx: CanvasRenderingContext2D,
  animatedItems: AnimatedItem[],
  canvasWidth: number,
  canvasHeight: number,
  backgroundStyle: React.CSSProperties
): void {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  if (backgroundStyle.backgroundColor) {
    ctx.fillStyle = backgroundStyle.backgroundColor as string;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  animatedItems.forEach(({ item, transform }) => {
    ctx.save();
    ctx.globalAlpha = transform.opacity;

    if (item.type === 'emoji') {
      const emojiItem = item as EmojiItem;
      const size = 80 * transform.scale;
      const centerX = transform.x + size / 2;
      const centerY = transform.y + size / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((transform.rotation * Math.PI) / 180);
      ctx.font = `${size * 0.8}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emojiItem.emoji, 0, 0);
    } else if (item.type === 'text') {
      const textItem = item as TextItem;
      const fontSize = textItem.style.fontSize * transform.scale;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.font = `bold ${fontSize}px ${textItem.style.fontFamily}`;
      const metrics = tempCtx.measureText(textItem.text);
      const textWidth = metrics.width;
      const textHeight = fontSize * 1.2;

      const centerX = transform.x + textWidth / 2;
      const centerY = transform.y + textHeight / 2;

      ctx.translate(centerX, centerY);
      ctx.rotate((transform.rotation * Math.PI) / 180);

      if (textItem.style.shadowBlur > 0 || textItem.style.shadowOffsetX !== 0 || textItem.style.shadowOffsetY !== 0) {
        ctx.shadowColor = textItem.style.shadowColor;
        ctx.shadowBlur = textItem.style.shadowBlur;
        ctx.shadowOffsetX = textItem.style.shadowOffsetX;
        ctx.shadowOffsetY = textItem.style.shadowOffsetY;
      }

      ctx.font = `bold ${fontSize}px ${textItem.style.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (textItem.style.strokeWidth > 0) {
        ctx.strokeStyle = textItem.style.strokeColor;
        ctx.lineWidth = textItem.style.strokeWidth * 2;
        ctx.strokeText(textItem.text, 0, 0);
      }

      ctx.fillStyle = textItem.style.color;
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.fillText(textItem.text, 0, 0);
    }

    ctx.restore();
  });
}

export function createOffscreenCanvas(width: number, height: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return { canvas, ctx };
}
