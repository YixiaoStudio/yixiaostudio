
import React, { useState, useEffect } from 'react';

interface PrimaryProductProps {
  onDownloadClick: () => void;
}

const carouselImages = [
  { id: 1, url: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/1.png', alt: '逸潇AI助手 核心界面展示' },
  { id: 2, url: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/2.png', alt: '一站式 AI 工具管理' },
  { id: 3, url: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/3.png', alt: '工作流自动化足迹' },
  { id: 4, url: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/4.png', alt: '高效信息分类管理' },
  { id: 5, url: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/5.png', alt: '个人效率资产库' },
];

const PrimaryProduct: React.FC<PrimaryProductProps> = ({ onDownloadClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播逻辑
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="primary-product" className="py-24 bg-zinc-50 border-y border-zinc-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-block px-3 py-1 rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold tracking-widest uppercase mb-6">
              FEATURED PRODUCT
            </div>
            <h2 className="text-4xl font-bold text-zinc-900 mb-6 leading-tight">
              逸潇AI助手：<br />
              面向AI时代的个人效率“黑盒”
            </h2>
            <p className="text-lg text-zinc-500 font-light leading-relaxed mb-10">
              在繁杂的 AI 时代，我们不只需要更多的模型，更需要一个有序的入口。逸潇 AI 助手帮助你整理常用的 AI 工具，并精准记录每一次对话与创作的时间线。
            </p>
            
            <div className="space-y-8 mb-10">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 mb-1 text-base">集中入口管理</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">一站式访问海量主流 AI 网站，无需在浏览器标签页中反复寻找，建立高效工作流。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 mb-1 text-base">用户共建 AI 工具池</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">推荐你正在使用的 AI 网站，通过审核后即可加入公共工具池，与所有用户共享。热门工具将基于使用与推荐情况自动排名，让真正好用的 AI 被看见。</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.2A7 7 0 0 1 11 20z"/><path d="M6 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M11 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/><path d="M16 15a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-900 mb-1 text-base">长期使用价值</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">我们关注数据的沉淀而非单纯的转发。随着使用时间增长，它将成为你最懂你的 AI 助理档案库。</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={onDownloadClick}
                className="bg-zinc-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                立即下载体验
              </button>
              <span className="text-xs text-zinc-400">目前支持 Windows</span>
            </div>
          </div>
          
          <div className="order-1 lg:order-2">
            <div className="relative aspect-square md:aspect-video lg:aspect-square bg-white rounded-3xl shadow-2xl shadow-zinc-200 border border-zinc-100 overflow-hidden group">
              {/* 轮播音轨 */}
              <div 
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {carouselImages.map((img) => (
                  <div key={img.id} className="min-w-full h-full">
                    <img 
                      src={encodeURI(img.url)} 
                      alt={img.alt} 
                      className="w-full h-full object-cover transition-all duration-700"
                      onError={(e) => {
                        // 如果图片加载失败，显示占位
                        (e.target as HTMLImageElement).src = `https://placehold.co/1000x1000/f4f4f5/71717a?text=Missing:+${encodeURIComponent(img.url.split('/').pop() || '')}`;
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* 渐变遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900/10 to-transparent pointer-events-none"></div>
              
              {/* 底部指示器 */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {carouselImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentIndex === idx ? 'w-8 bg-zinc-900' : 'w-2 bg-zinc-200'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* 悬浮标签 */}
              <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/50 shadow-sm">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter">AI Assistant</p>
                <p className="text-xs text-zinc-900 font-medium">
                  {carouselImages[currentIndex].alt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrimaryProduct;
