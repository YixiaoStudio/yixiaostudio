
import React from 'react';

interface NavbarProps {
  onDownloadClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onDownloadClick }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-zinc-900">逸潇工作室</span>
          <span className="text-sm text-zinc-400 font-light hidden sm:inline">| Yixiao Studio</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <a href="#hero" className="hover:text-zinc-900 transition-colors">首页</a>
          <a href="#primary-product" className="hover:text-zinc-900 transition-colors">主推产品</a>
          <a href="#matrix" className="hover:text-zinc-900 transition-colors">产品矩阵</a>
          <a href="#philosophy" className="hover:text-zinc-900 transition-colors">品牌理念</a>
        </div>
        <button 
          onClick={onDownloadClick}
          className="bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-medium hover:bg-zinc-800 transition-all"
        >
          立即下载
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
