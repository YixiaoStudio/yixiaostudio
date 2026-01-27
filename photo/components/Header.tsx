import React from 'react';
import { Link } from 'react-router-dom';

// 新增props类型，接收登录相关状态和方法
interface HeaderProps {
  currentUser?: any;          // 当前登录用户
  onLoginClick?: () => void;  // 点击登录按钮的回调
  onLogoutClick?: () => void; // 点击退出按钮的回调
}

// 保留所有原有代码，仅修改登录按钮部分
const Header: React.FC<HeaderProps> = ({ currentUser, onLoginClick, onLogoutClick }) => {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          {/* 替换原有SVG图标为指定URL的图片 */}
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center ">
            <img
              src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/icon-yixiaociyuanpai.png"
              alt="逸潇次元拍图标"
              className="w-8.8 h-8.8 object-contain" // 保持和原SVG一样的显示大小，object-contain确保图片完整显示
            />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            逸潇次元拍
          </span>
        </Link>

        <nav className="hidden lg:flex space-x-8 text-gray-600 font-medium">
          <Link to="/" className="hover:text-indigo-600 transition-colors">浏览模版</Link>
          <button className="hover:text-indigo-600 transition-colors">艺术馆</button>
          <button className="hover:text-indigo-600 transition-colors">创作指南</button>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Points Display - 保留原有样式 */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100 hover:shadow-md transition-all cursor-pointer group">
            <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-amber-700 text-xs font-black">1,280</span>
          </div>

          {/* PLUS+ Badge - 保留原有样式/动画 */}
          <button className="relative group overflow-hidden px-4 py-1.5 bg-gray-900 text-white rounded-full transition-all hover:ring-2 hover:ring-amber-400">
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-black tracking-tighter italic bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-yellow-500">
                PLUS+
              </span>
            </div>
            {/* Shimmer overlay - 保留原有动画 */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
          </button>

          <div className="h-6 w-px bg-gray-200 hidden sm:block mx-1" />

          {/* 替换原有登录按钮：根据登录状态显示 登录/退出 */}
          {currentUser ? (
            // 已登录：显示用户名 + 退出按钮（保留原有样式风格）
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-gray-700 text-sm font-medium">
                {currentUser.username}
              </span>
              <button
                onClick={onLogoutClick}
                className="px-4 py-2 text-red-600 font-bold hover:text-red-700 rounded-full transition-colors text-sm"
              >
                退出
              </button>
            </div>
          ) : (
            // 未登录：保留原有登录按钮样式，新增点击回调
            <button
              onClick={onLoginClick}
              className="hidden sm:block px-4 py-2 text-gray-500 font-bold hover:text-indigo-600 rounded-full transition-colors text-sm"
            >
              登录
            </button>
          )}

          {/* 开启创作按钮 - 保留所有原有样式 */}
          <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-full font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden xs:inline">开启创作</span>
          </button>
        </div>
      </div>

      {/* 保留原有样式/动画 */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @media (max-width: 400px) {
          .xs\:inline { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Header;