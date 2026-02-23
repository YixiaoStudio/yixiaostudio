
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEMPLATES, CATEGORIES } from '../constants';
import TemplateCard from '../components/TemplateCard';
import { Category, Template } from '../types';

const ITEMS_PER_PAGE = 20;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<Category | '热门'>('全部');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usageStats, setUsageStats] = useState<Record<string, number>>({});

  useEffect(() => {
    setCurrentPage(1);
    // 加载实时热度统计
    const stats = JSON.parse(localStorage.getItem('ai-template-usage-stats') || '{}');
    setUsageStats(stats);
  }, [activeCategory, searchQuery]);

  // 合并热度并排序的逻辑
  const sortedTemplates = useMemo(() => {
    const merged = TEMPLATES.map(t => ({
      ...t,
      usageCount: (t.usageCount || 0) + (usageStats[t.id] || 0)
    }));

    let filtered = merged;
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (activeCategory === '热门') {
      return [...filtered].sort((a, b) => b.usageCount - a.usageCount);
    }
    
    if (activeCategory !== '全部') {
      filtered = filtered.filter(t => t.category === activeCategory);
    }
    
    // 非热门分类默认按使用次数降序，让最受欢迎的排前面
    return [...filtered].sort((a, b) => b.usageCount - a.usageCount);
  }, [activeCategory, usageStats, searchQuery]);

  // 今日热推（前 5 名）
  const topRecommendations = useMemo(() => {
    return [...TEMPLATES]
      .map(t => ({ ...t, usageCount: (t.usageCount || 0) + (usageStats[t.id] || 0) }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
  }, [usageStats]);

  const totalPages = Math.ceil(sortedTemplates.length / ITEMS_PER_PAGE);

  const currentTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedTemplates, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const categoryElement = document.getElementById('category-nav');
    if (categoryElement) {
      const top = categoryElement.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>全网累计已生成写真 {(Object.values(usageStats) as number[]).reduce((a: number, b: number) => a + b, 0) + 450000}+ 次</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-tight">
          定义你的<br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
            第二人生写真
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          海量库现已开放。无论身在何处，只需一张照片，即可在顶级场景中自由穿梭。
        </p>
      </section>

      {/* 今日热推横向展示 */}
      <section className="mb-20 overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-4">
           <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900">今日热门排行</h2>
           </div>
           <span className="text-xs font-bold text-gray-400">实时热度更新中</span>
        </div>
        
        <div className="flex overflow-x-auto pb-8 gap-6 px-4 no-scrollbar scroll-smooth">
           {topRecommendations.map((t, idx) => (
             <div 
               key={`top-${t.id}`} 
               onClick={() => navigate(`/template/${t.id}`)}
               className="flex-none w-64 md:w-80 group cursor-pointer"
             >
                <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl group-hover:shadow-2xl transition-all duration-500">
                   <img src={t.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="top" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                   <div className="absolute top-6 left-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-black border border-white/30 italic">
                      #{idx + 1}
                   </div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-white font-black text-lg truncate">{t.title}</h3>
                      <p className="text-white/60 text-[10px] font-bold mt-1 uppercase tracking-widest">{t.usageCount} 人参与创作</p>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </section>

      {/* 旅拍入口卡片 */}
      <section 
        onClick={() => navigate('/map')}
        className="mb-16 bg-gradient-to-br from-slate-900 to-black rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between cursor-pointer group hover:shadow-2xl transition-all shadow-xl"
      >
         <div className="md:w-1/2 space-y-4">
            <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest bg-teal-400/10 px-3 py-1 rounded-full">New Experience</span>
            <h2 className="text-3xl font-black text-white">开启环球 AI 旅拍</h2>
            <p className="text-slate-400 text-sm max-w-sm">
              点亮全球 20+ 个热门地标，生成异国他乡的写真。集齐足迹可解锁限定“环球旅行者”勋章。
            </p>
            <div className="pt-4">
               <button className="px-8 py-3 bg-teal-500 text-white font-black rounded-xl text-xs hover:bg-teal-400 transition-all flex items-center space-x-2">
                  <span>进入旅行地图</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </button>
            </div>
         </div>
         <div className="md:w-1/2 relative mt-8 md:mt-0 flex justify-center">
            <div className="relative w-64 h-64">
               <div className="absolute inset-0 bg-teal-500/20 blur-[60px] rounded-full animate-pulse" />
               <div className="relative z-10 w-full h-full rounded-[2.5rem] border border-white/10 bg-white/5 flex items-center justify-center group-hover:rotate-6 transition-transform">
                  <span className="text-7xl">🌍</span>
               </div>
            </div>
         </div>
      </section>

      {/* Category Tabs & Search */}
      <div id="category-nav" className="sticky top-20 z-40 flex flex-col items-center mb-16 space-y-6">
        <div className="inline-flex p-1.5 bg-gray-200/50 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-xl shadow-gray-200/50 overflow-x-auto max-w-full no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value as any)}
              className={`px-6 sm:px-8 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-500 whitespace-nowrap flex items-center space-x-2 ${
                activeCategory === cat.value
                  ? 'bg-white text-indigo-600 shadow-lg scale-105'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {cat.value === '热门' && <span>🔥</span>}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="搜索模版标题或标签 (如: 汉服, 巴黎, 时尚...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-lg transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {currentTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 items-start">
          {currentTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
            🔍
          </div>
          <p className="text-gray-500 font-medium">没有找到匹配 "{searchQuery}" 的模版</p>
          <button 
            onClick={() => {setSearchQuery(''); setActiveCategory('全部');}}
            className="text-indigo-600 font-bold hover:underline"
          >
            重置搜索条件
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-24 mb-10 flex items-center justify-center space-x-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
              currentPage === 1 
                ? 'text-gray-200 cursor-not-allowed' 
                : 'text-gray-600 bg-white shadow-sm hover:shadow-md hover:text-indigo-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-12 h-12 rounded-2xl font-black transition-all text-sm ${
                  currentPage === page 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-110' 
                    : 'bg-white text-gray-500 hover:bg-gray-50 shadow-sm'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
              currentPage === totalPages 
                ? 'text-gray-200 cursor-not-allowed' 
                : 'text-gray-600 bg-white shadow-sm hover:shadow-md hover:text-indigo-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
      
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Home;
