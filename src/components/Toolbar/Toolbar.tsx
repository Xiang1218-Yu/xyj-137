import { useState } from 'react';
import { 
  Copy, 
  Download, 
  Trash2, 
  Undo2, 
  Redo2, 
  Sparkles,
  Check
} from 'lucide-react';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { exportAsPng, copyImageToClipboard, downloadImage } from '@/utils/exportImage';

interface ToolbarProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export function Toolbar({ canvasRef }: ToolbarProps) {
  const { emojis, clearCanvas, undo, redo, historyIndex, history } = useCanvasStore();
  const [copySuccess, setCopySuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const hasEmojis = emojis.length > 0;

  const handleCopy = async () => {
    if (!canvasRef.current || !hasEmojis) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await exportAsPng(canvasRef.current);
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
    if (!canvasRef.current || !hasEmojis) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await exportAsPng(canvasRef.current);
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
          disabled={!hasEmojis}
          className="p-2.5 rounded-xl text-gray-600 hover:bg-red-100 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          title="清空画布"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={!hasEmojis || isExporting}
          className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-md text-gray-700 rounded-2xl font-medium shadow-lg border border-white/50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          <Download className="w-5 h-5" />
          <span>下载</span>
        </button>
        
        <button
          onClick={handleCopy}
          disabled={!hasEmojis || isExporting}
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
