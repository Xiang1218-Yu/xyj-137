import { useState } from 'react';
import { 
  Copy, 
  Download, 
  Trash2, 
  Undo2, 
  Redo2, 
  Sparkles,
  Check,
  Film,
  Image
} from 'lucide-react';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { exportEmojisAsPng, copyImageToClipboard, downloadImage } from '@/utils/exportImage';
import { generateAnimationFrames, downloadGIF, downloadAPNG } from '@/utils/animationEncoder';
import { buildBackgroundStyles } from '@/utils/backgroundStyles';

export function Toolbar() {
  const { items, clearCanvas, undo, redo, historyIndex, history, canvasSize, background, animationSettings } = useCanvasStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isAnimExporting, setIsAnimExporting] = useState<'gif' | 'apng' | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasItems = items.length > 0;
  const hasAnyAnimation = items.some(item => item.animation && item.animation.preset !== 'none');
  const { frameCount, frameDelay } = animationSettings;

  const handleExportAnimation = async (format: 'gif' | 'apng') => {
    if (!hasItems || isAnimExporting) return;

    setIsAnimExporting(format);
    try {
      const frames = await generateAnimationFrames(
        items,
        canvasSize.width,
        canvasSize.height,
        frameCount,
        frameDelay,
        background,
        buildBackgroundStyles
      );

      const filename = `animation-${Date.now()}.${format === 'gif' ? 'gif' : 'png'}`;
      if (format === 'gif') {
        downloadGIF(frames, canvasSize.width, canvasSize.height, filename);
      } else {
        downloadAPNG(frames, canvasSize.width, canvasSize.height, filename);
      }
    } catch (error) {
      console.error(`Export ${format} failed:`, error);
    } finally {
      setIsAnimExporting(null);
    }
  };

  const handleCopy = async () => {
    if (!hasItems && background.opacity === 0) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await exportEmojisAsPng(items, canvasSize.width, canvasSize.height, background);
      const success = await copyImageToClipboard(dataUrl);
      
      if (success) {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Copy failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    if (!hasItems && background.opacity === 0) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await exportEmojisAsPng(items, canvasSize.width, canvasSize.height, background);
      downloadImage(dataUrl, `emoji-combo-${Date.now()}.png`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2.5 rounded-xl text-gray-600 hover:bg-purple-100 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 className="w-5 h-5" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2.5 rounded-xl text-gray-600 hover:bg-purple-100 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="重做 (Ctrl+Y)"
        >
          <Redo2 className="w-5 h-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />
        
        <button
          onClick={clearCanvas}
          disabled={!hasItems}
          className="p-2.5 rounded-xl text-gray-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="清空画布"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={isExporting || !!isAnimExporting}
          className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-2xl font-medium shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
          title="下载 PNG 图片"
        >
          <Download className="w-5 h-5" />
          <span>PNG</span>
        </button>

        <div className="flex items-center gap-1 px-1 py-1 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/50">
          <button
            onClick={() => handleExportAnimation('gif')}
            disabled={isExporting || !!isAnimExporting || !hasAnyAnimation}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isAnimExporting === 'gif'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white cursor-wait'
                : !hasAnyAnimation
                ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                : 'text-gray-700 hover:bg-purple-100 hover:text-purple-600'
            } disabled:opacity-50 disabled:hover:scale-100`}
            title={hasAnyAnimation ? '导出 GIF 动画' : '请先选择动画预设'}
          >
            {isAnimExporting === 'gif' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Film className="w-4 h-4" />
            )}
            <span className="text-sm">GIF</span>
          </button>
          <button
            onClick={() => handleExportAnimation('apng')}
            disabled={isExporting || !!isAnimExporting || !hasAnyAnimation}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-medium transition-all ${
              isAnimExporting === 'apng'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white cursor-wait'
                : !hasAnyAnimation
                ? 'text-gray-400 cursor-not-allowed hover:bg-transparent'
                : 'text-gray-700 hover:bg-blue-100 hover:text-blue-600'
            } disabled:opacity-50 disabled:hover:scale-100`}
            title={hasAnyAnimation ? '导出 APNG 动画' : '请先选择动画预设'}
          >
            {isAnimExporting === 'apng' ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image className="w-4 h-4" />
            )}
            <span className="text-sm">APNG</span>
          </button>
        </div>
        
        <button
          onClick={handleCopy}
          disabled={isExporting || !!isAnimExporting}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium shadow-lg transition-all ${
            copySuccess
              ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
              : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:shadow-xl hover:scale-105'
          } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          {copySuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>已复制!</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>复制图片</span>
            </>
          )}
          <Sparkles className="w-4 h-4 opacity-80" />
        </button>
      </div>
    </div>
  );
}
