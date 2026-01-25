
import React, { useState, useMemo, useEffect } from 'react';
import { POPULAR_TOOLS, CATEGORIES } from '../constants';

interface ToolGridProps {
  searchQuery: string;
}

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const ToolGrid: React.FC<ToolGridProps> = ({ searchQuery }) => {
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedCounts = localStorage.getItem('yixiao_ai_tool_clicks');
    const savedFavs = localStorage.getItem('yixiao_favorites');
    if (savedCounts) setClickCounts(JSON.parse(savedCounts));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const handleToolClick = (toolId: string) => {
    const newCounts = {
      ...clickCounts,
      [toolId]: (clickCounts[toolId] || 0) + 1
    };
    setClickCounts(newCounts);
    localStorage.setItem('yixiao_ai_tool_clicks', JSON.stringify(newCounts));
    window.dispatchEvent(new Event('storage'));
  };

  const toggleFavorite = (e: React.MouseEvent, toolId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(toolId) 
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavs);
    localStorage.setItem('yixiao_favorites', JSON.stringify(newFavs));
  };

  const filteredAndSortedTools = useMemo(() => {
    let tools = POPULAR_TOOLS.filter(tool => {
      const matchesCategory = selectedCategory === '全部' || tool.category === selectedCategory;
      const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    return tools.sort((a, b) => {
      const countA = clickCounts[a.id] || 0;
      const countB = clickCounts[b.id] || 0;
      return countB - countA;
    });
  }, [selectedCategory, searchQuery, clickCounts]);

  return (
    <div className="py-4">
      {/* Category Filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                : 'bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAndSortedTools.map((tool) => {
          const clicks = clickCounts[tool.id] || 0;
          const isFav = favorites.includes(tool.id);
          return (
            <div 
              key={tool.id} 
              className="relative bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              <button 
                onClick={(e) => toggleFavorite(e, tool.id)}
                className={`absolute top-4 right-4 p-2 rounded-xl transition-all ${
                  isFav ? 'bg-amber-100 text-amber-500 scale-110' : 'bg-gray-50 text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>

              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform origin-left p-2">
                <img src={getHandDrawnIcon(tool.icon || 'idea')} className="w-full h-full object-contain" alt={tool.name} />
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{tool.name}</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">{tool.category}</p>
              
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center space-x-2">
                  <img src={getHandDrawnIcon('fire')} className="w-5 h-5" alt="hot" />
                  <span className="text-xs font-black text-slate-800">{clicks}</span>
                </div>
                <a 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleToolClick(tool.id)}
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center space-x-2"
                >
                  <span>访问官网</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ToolGrid;
