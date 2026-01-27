
import React, { useState, useMemo, useEffect } from 'react';
import { TEMPLATES, CATEGORIES } from '../constants';
import TemplateCard from '../components/TemplateCard';
import { Category } from '../types';

const ITEMS_PER_PAGE = 20;

const Home: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('全部');
  const [currentPage, setCurrentPage] = useState(1);

  // 切换分类时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  const filteredTemplates = useMemo(() => {
    if (activeCategory === '全部') return TEMPLATES;
    return TEMPLATES.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  const totalPages = Math.ceil(filteredTemplates.length / ITEMS_PER_PAGE);

  const currentTemplates = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTemplates, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // 平滑滚动至分类栏位置，而不是页面最顶端，体验更好
    const categoryElement = document.getElementById('category-nav');
    if (categoryElement) {
      const top = categoryElement.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: '逸潇次元拍',
        text: '这里有 100+ 款 AI 写真模版，快来看看！',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('已复制链接到剪贴板！');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Hero Section */}
      <section className="text-center mb-20 space-y-6">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-bold tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          <span>系统已收录 100 个顶级模版</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter leading-tight">
          定义你的<br/>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600">
            第二人生写真
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          海量库现已开放，支持 100 种风格。无论身在何处，只需一张照片，即可在顶级场景中自由穿梭。
        </p>
        <div className="pt-4">
          <button 
            onClick={handleShare}
            className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center space-x-2 mx-auto hover:bg-black transition-all shadow-xl active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>分享作品库</span>
          </button>
        </div>
      </section>

      {/* Category Tabs */}
      <div id="category-nav" className="sticky top-20 z-40 flex justify-center mb-16 pb-4">
        <div className="inline-flex p-1.5 bg-gray-200/50 backdrop-blur-xl rounded-[1.5rem] border border-white shadow-xl shadow-gray-200/50">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value as Category)}
              className={`px-6 sm:px-8 py-3 rounded-[1.2rem] font-black text-sm transition-all duration-500 whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'bg-white text-indigo-600 shadow-lg scale-105'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10 min-h-[800px]">
        {currentTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {/* Empty State */}
      {currentTemplates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-40 text-gray-400">
          <svg className="w-20 h-20 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xl font-medium">该分类下暂无模版</p>
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
    </div>
  );
};

export default Home;
