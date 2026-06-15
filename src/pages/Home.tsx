import { useRef, useEffect, useState } from 'react';
import { EmojiPicker } from '@/components/EmojiPicker/EmojiPicker';
import { Canvas } from '@/components/Canvas/Canvas';
import { ControlPanel } from '@/components/ControlPanel/ControlPanel';
import { AnimationPanel } from '@/components/AnimationPanel/AnimationPanel';
import { Toolbar } from '@/components/Toolbar/Toolbar';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { Sliders, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type RightPanelTab = 'properties' | 'animation';

export default function Home() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const undo = useCanvasStore(state => state.undo);
  const redo = useCanvasStore(state => state.redo);
  const selectedId = useCanvasStore(state => state.selectedId);
  const removeItem = useCanvasStore(state => state.removeItem);
  const [activeTab, setActiveTab] = useState<RightPanelTab>('animation');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        removeItem(selectedId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedId, removeItem]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex flex-col">
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(251, 113, 133, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        <header className="py-6 px-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 flex items-center justify-center text-2xl shadow-lg">
                ✨
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  Emoji 合成器
                </h1>
                <p className="text-sm text-gray-500">自由组合，创造独一无二的表情 · 支持动画导出</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-3 py-1.5 bg-white/60 backdrop-blur-sm rounded-full shadow-sm">
                快捷键: Ctrl+Z 撤销 · Delete 删除
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 px-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="grid grid-cols-12 gap-6 h-full">
              <div className="col-span-3 h-full min-h-0">
                <EmojiPicker />
              </div>

              <div className="col-span-6 flex flex-col h-full min-h-0">
                <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
                  <Canvas canvasRef={canvasRef} />
                </div>
                <div className="mt-6 flex-shrink-0">
                  <Toolbar />
                </div>
              </div>

              <div className="col-span-3 h-full min-h-0 flex flex-col">
                <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-white/60 backdrop-blur-sm rounded-2xl shadow-md border border-white/50 mb-3">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                      activeTab === 'properties'
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
                    )}
                  >
                    <Sliders className="w-4 h-4" />
                    <span>属性</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('animation')}
                    className={cn(
                      "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-sm font-medium transition-all",
                      activeTab === 'animation'
                        ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-sm"
                        : "text-gray-600 hover:text-pink-600 hover:bg-white/50"
                    )}
                  >
                    <Wand2 className="w-4 h-4" />
                    <span>动画</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                  {activeTab === 'properties' ? (
                    <ControlPanel />
                  ) : (
                    <div className="h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden p-4">
                      <AnimationPanel />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="py-4 px-8 text-center text-sm text-gray-400 flex-shrink-0">
          <p>🎨 尽情发挥创意，制作属于你的专属表情 · 支持 GIF/APNG 动画导出</p>
        </footer>
      </div>
    </div>
  );
}
