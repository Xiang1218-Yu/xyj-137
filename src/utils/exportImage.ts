import { toPng } from 'html-to-image';
import type { EmojiItem } from '@/hooks/useCanvasStore';

export async function exportEmojisAsPng(
  emojis: EmojiItem[],
  canvasWidth: number,
  canvasHeight: number
): Promise<string> {
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: 0;
    top: 0;
    width: ${canvasWidth}px;
    height: ${canvasHeight}px;
    background-color: transparent;
    pointer-events: none;
    z-index: -1;
    overflow: hidden;
  `;

  const sortedEmojis = [...emojis].sort((a, b) => a.zIndex - b.zIndex);

  sortedEmojis.forEach((item) => {
    const size = 80 * item.scale;
    const el = document.createElement('div');
    el.style.cssText = `
      position: absolute;
      left: ${item.x}px;
      top: ${item.y}px;
      width: ${size}px;
      height: ${size}px;
      z-index: ${item.zIndex};
      transform: rotate(${item.rotation}deg);
      font-size: ${size * 0.8}px;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    `;
    el.textContent = item.emoji;
    container.appendChild(el);
  });

  document.body.appendChild(container);

  try {
    const dataUrl = await toPng(container, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: 'transparent',
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
  } finally {
    document.body.removeChild(container);
  }
}

export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy image to clipboard:', error);
    return false;
  }
}

export function downloadImage(dataUrl: string, filename: string = 'emoji-combo.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
