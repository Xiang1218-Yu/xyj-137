import { useState } from 'react';
import { Search } from 'lucide-react';
import { emojiCategories } from '@/utils/emojiData';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';
import { MosaicControls } from '@/components/MosaicPanel/MosaicPanel';

type PickerTab = 'emoji' | 'text' | 'mosaic';

export function EmojiPicker() {
  const [activeTab, setActiveTab] = useState<PickerTab>('emoji');
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const addEmoji = useCanvasStore(state => state.addEmoji);
  const addText = useCanvasStore(state => state.addText);

  const filteredEmojis = searchQuery
    ? emojiCategories.flatMap(cat => cat.emojis).filter(e => e.includes(searchQuery))
    : emojiCategories[activeCategory].emojis;

  const handleEmojiClick = (emoji: string) => {
    addEmoji(emoji);
  };

  const handleAddText = (text: string) => {
    addText(text);
  };

  const QUICK_TEXTS = [
    '你好',
    '哈哈哈',
    '谢谢',
    '爱你',
    '加油',
    '冲鸭',
    '赞',
    '酷',
    '可爱',
    '开心',
    '难过',
    '生气',
  ];

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
          ✨ 元素库
        </h3>
        
        <div className="flex gap-1 mb-3 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('emoji')}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'emoji'
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            😊 表情
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'text'
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            🔤 文字
          </button>
          <button
            onClick={() => setActiveTab('mosaic')}
            className={cn(
              "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeTab === 'mosaic'
                ? "bg-white text-purple-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            ✨ 拼贴
          </button>
        </div>

        {activeTab === 'emoji' && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索表情..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
            />
          </div>
        )}

        {activeTab === 'text' && (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="输入文字..."
              id="text-input"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    handleAddText(input.value.trim());
                    input.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.getElementById('text-input') as HTMLInputElement;
                if (input && input.value.trim()) {
                  handleAddText(input.value.trim());
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              添加
            </button>
          </div>
        )}
      </div>

      {activeTab === 'emoji' && !searchQuery && (
        <div className="flex gap-1 p-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
          {emojiCategories.map((cat, index) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(index)}
              className={cn(
                "flex-shrink-0 px-3 py-2 rounded-lg text-lg transition-all duration-200",
                activeCategory === index
                  ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md scale-105"
                  : "hover:bg-gray-100 text-gray-600"
              )}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      <div className={cn(
        "flex-1",
        activeTab === 'mosaic' ? 'overflow-hidden' : 'overflow-y-auto p-3'
      )}>
        {activeTab === 'emoji' && (
          <div className="grid grid-cols-6 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                className="aspect-square flex items-center justify-center text-2xl rounded-xl hover:bg-gradient-to-br hover:from-pink-100 hover:to-purple-100 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'text' && (
          <div>
            <p className="text-xs text-gray-500 mb-3">快捷文字</p>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_TEXTS.map((text) => (
                <button
                  key={text}
                  onClick={() => handleAddText(text)}
                  className="px-3 py-2 bg-gradient-to-br from-pink-50 to-purple-50 border border-purple-100 rounded-xl text-sm font-medium text-gray-700 hover:from-pink-100 hover:to-purple-100 hover:scale-105 active:scale-95 transition-all duration-200 truncate"
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                💡 在上方输入框输入自定义文字
              </p>
            </div>
          </div>
        )}

        {activeTab === 'mosaic' && (
          <div className="h-full p-4">
            <MosaicControls />
          </div>
        )}

        {activeTab === 'emoji' && filteredEmojis.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">没有找到相关表情</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          {activeTab === 'emoji' && '点击表情添加到画布'}
          {activeTab === 'text' && '点击或输入文字添加到画布'}
          {activeTab === 'mosaic' && '设置参数后点击生成拼贴画'}
        </p>
      </div>
    </div>
  );
}
