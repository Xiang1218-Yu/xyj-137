import { toPng } from 'html-to-image';
import type { CanvasItem, EmojiItem, TextItem } from '@/hooks/useCanvasStore';

export async function exportItemsAsPng(
  items: CanvasItem[],
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

  const sortedItems = [...items].sort((a, b) => a.zIndex - b.zIndex);

  sortedItems.forEach((item) => {
    if (item.type === 'emoji') {
      const emojiItem = item as EmojiItem;
      const size = 80 * emojiItem.scale;
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${emojiItem.x}px;
        top: ${emojiItem.y}px;
        width: ${size}px;
        height: ${size}px;
        z-index: ${emojiItem.zIndex};
        transform: rotate(${emojiItem.rotation}deg);
        font-size: ${size * 0.8}px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      `;
      el.textContent = emojiItem.emoji;
      container.appendChild(el);
    } else if (item.type === 'text') {
      const textItem = item as TextItem;
      const fontSize = textItem.style.fontSize * textItem.scale;
      const textShadow = textItem.style.shadowBlur > 0 || textItem.style.shadowOffsetX !== 0 || textItem.style.shadowOffsetY !== 0
        ? `${textItem.style.shadowOffsetX}px ${textItem.style.shadowOffsetY}px ${textItem.style.shadowBlur}px ${textItem.style.shadowColor}`
        : 'none';
      
      const el = document.createElement('div');
      el.style.cssText = `
        position: absolute;
        left: ${textItem.x}px;
        top: ${textItem.y}px;
        z-index: ${textItem.zIndex};
        transform: rotate(${textItem.rotation}deg);
        font-family: ${textItem.style.fontFamily};
        font-size: ${fontSize}px;
        font-weight: bold;
        color: ${textItem.style.color};
        text-shadow: ${textShadow};
        -webkit-text-stroke: ${textItem.style.strokeWidth > 0 ? textItem.style.strokeWidth + 'px ' + textItem.style.strokeColor : 'none'};
        paint-order: stroke fill;
        line-height: 1.2;
        white-space: nowrap;
      `;
      el.textContent = textItem.text;
      container.appendChild(el);
    }
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

export async function exportEmojisAsPng(
  items: CanvasItem[],
  canvasWidth: number,
  canvasHeight: number
): Promise<string> {
  return exportItemsAsPng(items, canvasWidth, canvasHeight);
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
