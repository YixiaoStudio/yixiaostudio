
import React from 'react';

interface HeroProps {
  onDownloadClick: () => void;
}

const Hero: React.FC<HeroProps> = ({ onDownloadClick }) => {
  return (
    <section id="hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase mb-4">YIXIAO STUDIO</h2>
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-900 leading-tight mb-8">
            长期可靠的产品，<br />
            解决用户需求与痛点。
          </h1>
          <p className="text-xl text-zinc-500 font-light leading-relaxed mb-10 max-w-2xl">
            逸潇工作室致力于构建长期可用的工具 ，解决你日常工作中遇到的真实问题。
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="flex-1">
              <h3 className="font-semibold text-zinc-900 mb-1">当前主推：逸潇AI助手</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">一站集中管理，告别分散AI工具和重复操作。</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <a 
                href="#primary-product" 
                className="flex-1 sm:flex-none text-center bg-zinc-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all"
              >
                了解更多
              </a>
              <button 
                onClick={onDownloadClick}
                className="flex-1 sm:flex-none text-center bg-white border border-zinc-200 text-zinc-900 px-6 py-3 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all"
              >
                下载软件
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-20 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-100 rounded-full blur-[100px]"></div>
      </div>
    </section>
  );
};

export default Hero;
