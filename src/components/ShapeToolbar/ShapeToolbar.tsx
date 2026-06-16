import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle, 
  Minus, 
  Ellipsis, 
  Star, 
  Pencil, 
  Paintbrush,
  Droplet,
  Palette,
  Radius,
  Sliders
} from 'lucide-react';
import { useCanvasStore, type DrawingTool } from '@/hooks/useCanvasStore';
import { cn } from '@/lib/utils';

const TOOL_CONFIG: { id: DrawingTool; name: string; icon: React.ReactNode }[] = [
  { id: 'select', name: '选择', icon: <MousePointer2 className="w-5 h-5" /> },
  { id: 'rectangle', name: '矩形', icon: <Square className="w-5 h-5" /> },
  { id: 'circle', name: '圆形', icon: <Circle className="w-5 h-5" /> },
  { id: 'ellipse', name: '椭圆', icon: <Ellipsis className="w-5 h-5" style={{ transform: 'rotate(90deg)' }} /> },
  { id: 'triangle', name: '三角形', icon: <Triangle className="w-5 h-5" /> },
  { id: 'star', name: '星形', icon: <Star className="w-5 h-5" /> },
  { id: 'line', name: '直线', icon: <Minus className="w-5 h-5" /> },
  { id: 'brush', name: '画笔', icon: <Pencil className="w-5 h-5" /> },
];

export function ShapeToolbar() {
  const { 
    currentTool, 
    setCurrentTool, 
    shapeStyle, 
    setShapeStyle,
    brushStyle,
    setBrushStyle,
  } = useCanvasStore();

  const isShapeTool = ['rectangle', 'circle', 'ellipse', 'triangle', 'star', 'line'].includes(currentTool);
  const isBrushTool = currentTool === 'brush';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col h-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            🎨 绘图工具
          </h3>
          
          <div className="grid grid-cols-4 gap-1.5">
            {TOOL_CONFIG.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setCurrentTool(tool.id)}
                title={tool.name}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 p-2.5 rounded-xl transition-all",
                  currentTool === tool.id
                    ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
                )}
              >
                {tool.icon}
                <span className="text-[10px] font-medium">{tool.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {isShapeTool && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                形状样式
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Droplet className="w-4 h-4 text-blue-500" />
                    <span>填充颜色</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {shapeStyle.fill}
                    </span>
                    <label className="relative w-8 h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                      <input
                        type="color"
                        value={shapeStyle.fill}
                        onChange={(e) => setShapeStyle({ fill: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: shapeStyle.fill }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Paintbrush className="w-4 h-4 text-pink-500" />
                    <span>描边颜色</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {shapeStyle.stroke}
                    </span>
                    <label className="relative w-8 h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                      <input
                        type="color"
                        value={shapeStyle.stroke}
                        onChange={(e) => setShapeStyle({ stroke: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: shapeStyle.stroke }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Minus className="w-4 h-4 text-orange-500" />
                      <span>描边粗细</span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {shapeStyle.strokeWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.5}
                    value={shapeStyle.strokeWidth}
                    onChange={(e) => setShapeStyle({ strokeWidth: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                {currentTool === 'rectangle' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <Radius className="w-4 h-4 text-green-500" />
                        <span>圆角半径</span>
                      </div>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                        {shapeStyle.borderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      step={1}
                      value={shapeStyle.borderRadius}
                      onChange={(e) => setShapeStyle({ borderRadius: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Palette className="w-4 h-4 text-blue-500" />
                      <span>透明度</span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {Math.round(shapeStyle.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={shapeStyle.opacity}
                    onChange={(e) => setShapeStyle({ opacity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {isBrushTool && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-500" />
                画笔样式
              </h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Paintbrush className="w-4 h-4 text-pink-500" />
                    <span>画笔颜色</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {brushStyle.color}
                    </span>
                    <label className="relative w-8 h-8 rounded-lg cursor-pointer overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-colors">
                      <input
                        type="color"
                        value={brushStyle.color}
                        onChange={(e) => setBrushStyle({ color: e.target.value })}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div 
                        className="absolute inset-0"
                        style={{ backgroundColor: brushStyle.color }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Minus className="w-4 h-4 text-orange-500" />
                      <span>画笔粗细</span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {brushStyle.strokeWidth}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={0.5}
                    value={brushStyle.strokeWidth}
                    onChange={(e) => setBrushStyle({ strokeWidth: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Palette className="w-4 h-4 text-blue-500" />
                      <span>透明度</span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {Math.round(brushStyle.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={brushStyle.opacity}
                    onChange={(e) => setBrushStyle({ opacity: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Ellipsis className="w-4 h-4 text-green-500" />
                      <span>平滑度</span>
                    </div>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded-lg text-gray-600">
                      {Math.round(brushStyle.smoothness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={brushStyle.smoothness}
                    onChange={(e) => setBrushStyle({ smoothness: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentTool === 'select' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600 text-center">
                  🖱️ 选择工具已激活
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  点击画布上的元素进行选择和编辑
                </p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 font-medium mb-2">💡 操作提示：</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• 拖拽可移动元素</li>
                  <li>• 拖拽右下角可缩放</li>
                  <li>• 拖拽顶部可旋转</li>
                  <li>• 方向键可微调位置</li>
                  <li>• Delete 键可删除元素</li>
                </ul>
              </div>
            </div>
          )}

          {isShapeTool && (
            <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <p className="text-xs text-gray-600 text-center">
                🎯 在画布上拖拽以绘制形状
              </p>
            </div>
          )}

          {isBrushTool && (
            <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
              <p className="text-xs text-gray-600 text-center">
                ✏️ 在画布上按住鼠标自由绘制
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
