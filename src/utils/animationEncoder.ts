import { GifWriter } from 'omggif';
import * as UPNG from 'upng-js';

export interface AnimationFrame {
  canvas: HTMLCanvasElement;
  delay: number;
}

function nextPowerOf2(n: number): number {
  let p = 2;
  while (p < n) p <<= 1;
  return Math.min(p, 256);
}

function quantizeImageData(imageData: ImageData, maxPaletteSize: number = 256): {
  indices: Uint8ClampedArray;
  palette: number[];
  paletteSize: number;
} {
  const data = imageData.data;
  const pixelCount = imageData.width * imageData.height;
  
  const colorMap = new Map<string, number>();
  const palette: number[] = [];
  const indices = new Uint8ClampedArray(pixelCount);
  
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const a = data[offset + 3];
    
    if (a < 128) {
      indices[i] = 0;
      if (palette.length === 0) {
        palette.push(0, 0, 0, 0);
      }
      continue;
    }
    
    const key = `${r},${g},${b}`;
    let colorIndex = colorMap.get(key);
    
    if (colorIndex === undefined) {
      if (palette.length / 4 >= maxPaletteSize) {
        let minDist = Infinity;
        let nearest = 0;
        for (let j = 0; j < palette.length; j += 4) {
          const dr = r - palette[j];
          const dg = g - palette[j + 1];
          const db = b - palette[j + 2];
          const dist = dr * dr + dg * dg + db * db;
          if (dist < minDist) {
            minDist = dist;
            nearest = j / 4;
          }
        }
        colorIndex = nearest;
      } else {
        colorIndex = palette.length / 4;
        palette.push(r, g, b, 255);
        colorMap.set(key, colorIndex);
      }
    }
    
    indices[i] = colorIndex;
  }
  
  const actualColorCount = palette.length / 4;
  const paletteSize = nextPowerOf2(Math.max(actualColorCount, 2));
  
  while (palette.length < paletteSize * 4) {
    palette.push(0, 0, 0, 0);
  }
  
  return { indices, palette, paletteSize };
}

export function encodeGIF(frames: AnimationFrame[], width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(width * height * frames.length * 4 + 1024 * 1024);
  const gif = new GifWriter(buffer as any, width, height, { loop: 0 });
  
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const ctx = frame.canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, width, height);
    const { indices, palette, paletteSize } = quantizeImageData(imageData, 256);
    
    const paletteRGB: number[] = [];
    for (let j = 0; j < paletteSize * 4; j += 4) {
      paletteRGB.push(palette[j], palette[j + 1], palette[j + 2]);
    }
    
    const delayCs = Math.max(2, Math.round(frame.delay / 10));
    gif.addFrame(0, 0, width, height, indices, {
      palette: paletteRGB,
      delay: delayCs,
      disposal: 2,
    });
  }
  
  const gifLength = gif.end();
  return buffer.slice(0, gifLength);
}

export function encodeAPNG(frames: AnimationFrame[], width: number, height: number): ArrayBuffer {
  const buffers: ArrayBuffer[] = [];
  const delays: number[] = [];
  
  for (const frame of frames) {
    const ctx = frame.canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, width, height);
    buffers.push(new Uint8Array(imageData.data).buffer);
    delays.push(frame.delay);
  }
  
  return UPNG.encode(buffers, width, height, 0, delays);
}

export function downloadGIF(frames: AnimationFrame[], width: number, height: number, filename: string = 'animation.gif'): void {
  const gifData = encodeGIF(frames, width, height);
  const blob = new Blob([gifData], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAPNG(frames: AnimationFrame[], width: number, height: number, filename: string = 'animation.png'): void {
  const apngData = encodeAPNG(frames, width, height);
  const blob = new Blob([apngData], { type: 'image/apng' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function generateAnimationFrames(
  items: any[],
  canvasWidth: number,
  canvasHeight: number,
  frameCount: number,
  frameDelay: number,
  background: any,
  backgroundStyleFn: (bg: any) => React.CSSProperties
): Promise<AnimationFrame[]> {
  const frames: AnimationFrame[] = [];
  
  for (let i = 0; i < frameCount; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;
    
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const bgStyles = backgroundStyleFn(background);
    if (bgStyles.backgroundColor) {
      ctx.fillStyle = bgStyles.backgroundColor as string;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    const { generateAnimatedItems } = await import('./animationUtils');
    const animatedItems = generateAnimatedItems(items, i, frameCount);
    
    for (const { item, transform } of animatedItems) {
      ctx.save();
      ctx.globalAlpha = transform.opacity;
      
      if (item.type === 'emoji') {
        const size = 80 * transform.scale;
        const centerX = transform.x + size / 2;
        const centerY = transform.y + size / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.font = `${size * 0.8}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
      } else if (item.type === 'text') {
        const fontSize = item.style.fontSize * transform.scale;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d')!;
        tempCtx.font = `bold ${fontSize}px ${item.style.fontFamily}`;
        const metrics = tempCtx.measureText(item.text);
        const textWidth = metrics.width;
        const textHeight = fontSize * 1.2;
        
        const centerX = transform.x + textWidth / 2;
        const centerY = transform.y + textHeight / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((transform.rotation * Math.PI) / 180);
        
        if (item.style.shadowBlur > 0 || item.style.shadowOffsetX !== 0 || item.style.shadowOffsetY !== 0) {
          ctx.shadowColor = item.style.shadowColor;
          ctx.shadowBlur = item.style.shadowBlur;
          ctx.shadowOffsetX = item.style.shadowOffsetX;
          ctx.shadowOffsetY = item.style.shadowOffsetY;
        }
        
        ctx.font = `bold ${fontSize}px ${item.style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (item.style.strokeWidth > 0) {
          ctx.strokeStyle = item.style.strokeColor;
          ctx.lineWidth = item.style.strokeWidth * 2;
          ctx.strokeText(item.text, 0, 0);
        }
        
        ctx.fillStyle = item.style.color;
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.fillText(item.text, 0, 0);
      }
      
      ctx.restore();
    }
    
    frames.push({ canvas, delay: frameDelay });
  }
  
  return frames;
}
