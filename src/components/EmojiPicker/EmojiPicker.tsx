import { useState } from 'react';
import { Search } from 'lucide-react';
import { emojiCategories } from '@/utils/emojiData';
import { useCanvasStore } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

export function EmojiPicker() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const addEmoji = useCanvasStore(state => state.addEmoji);

  const filteredEmojis = searchQuery
    ? emojiCategories.flatMap(cat => cat.emojis).filter(e => e.includes(searchQuery))
    : emojiCategories[activeCategory].emojis;

  const handleEmojiClick = (emoji: string) => {
    addEmoji(emoji);
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-3">
          ✨ Emoji 库
        </h3>
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
      </div>

      {!searchQuery && (
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

      <div className="flex-1 overflow-y-auto p-3">
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
        {filteredEmojis.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-4xl mb-2">🔍</p>
            <p className="text-sm">没有找到相关表情</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          点击表情添加到画布
        </p>
      </div>
    </div>
  );
}
