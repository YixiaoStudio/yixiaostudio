
import React, { useState, useEffect } from 'react';
import { POPULAR_TOOLS } from '../constants';
import { FavoriteUsage, AITool } from '../types';

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const FavoritesView: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [usageData, setUsageData] = useState<Record<string, FavoriteUsage>>({});
  const [userTools, setUserTools] = useState<AITool[]>([]);

  useEffect(() => {
    const savedFavs = localStorage.getItem('yixiao_favorites');
    const savedUsage = localStorage.getItem('yixiao_usage_data');
    const savedUserTools = localStorage.getItem('yixiao_user_tools');
    
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
    if (savedUsage) setUsageData(JSON.parse(savedUsage));
    if (savedUserTools) setUserTools(JSON.parse(savedUserTools));
  }, []);

  const allAvailableTools = [...POPULAR_TOOLS, ...userTools];
  const favoriteTools = allAvailableTools.filter(t => favorites.includes(t.id));

  if (favoriteTools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
        <img src={getHandDrawnIcon('star')} className="w-24 h-24 mb-6" alt="empty" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">暂无收藏应用</h3>
        <p className="text-gray-500 max-w-sm">在“工具广场”中点击收藏，记录您的 AI 探索足迹。</p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 animate-fade-in">
      <div className="mb-10 flex items-center space-x-4">
        <img src={getHandDrawnIcon('pin')} className="w-12 h-12" alt="fav-title" />
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-1">我的收藏</h2>
          <p className="text-gray-500 font-medium">记录您的数字资产与使用概览</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {favoriteTools.map(tool => {
          const usage = usageData[tool.id] || {
            toolId: tool.id,
            lastUsedDate: new Date().toLocaleDateString(),
            totalTimeMinutes: 45,
            remainingPoints: 1250
          };

          return (
            <div key={tool.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform p-2">
                    <img src={getHandDrawnIcon(tool.icon || 'idea')} className="w-full h-full object-contain" alt={tool.name} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full font-bold uppercase">{tool.category}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <img src={getHandDrawnIcon('coins')} className="w-6 h-6 mb-2" alt="points" />
                    <p className="text-xl font-black text-indigo-600 leading-none">{usage.remainingPoints}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">剩余点数</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col items-center text-center">
                    <img src={getHandDrawnIcon('time')} className="w-6 h-6 mb-2" alt="time" />
                    <p className="text-xl font-black text-slate-800 leading-none">{usage.totalTimeMinutes}m</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">使用时长</p>
                  </div>
                </div>

                <a 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  <img src={getHandDrawnIcon('flash-light')} className="w-5 h-5 brightness-0 invert" alt="launch" />
                  <span>立即启动</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesView;
