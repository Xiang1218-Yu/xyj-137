import { toPng } from 'html-to-image';

export async function exportAsPng(element: HTMLElement): Promise<string> {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      cacheBust: true,
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to export image:', error);
    throw error;
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
