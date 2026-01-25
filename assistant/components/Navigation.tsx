import React from 'react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  // 1. 给每个标签页添加自定义图标URL字段（核心修改）
  const navItems = [
    { 
      id: TabType.HOME, 
      label: '工具广场', 
      slug: 'colosseum',
      // 替换成你的【工具广场】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/tool-plaza.png' 
    },
    { 
      id: TabType.FAVORITES, 
      label: '我的收藏', 
      slug: 'star',
      // 替换成你的【我的收藏】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/xxx/my-collection.png' 
    },
    { 
      id: TabType.FEATURED_ARTIFACTS, 
      label: '精选神器', 
      slug: 'magic-wand',
      // 替换成你的【精选神器】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/featured-tools.png' 
    },
    { 
      id: TabType.USER_POOL, 
      label: '自建AI池', 
      slug: 'crane',
      // 替换成你的【自建AI池】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/xxx/custom-ai-pool.png' 
    },
    { 
      id: TabType.FORUM, 
      label: '用户论坛', 
      slug: 'museum',
      // 替换成你的【用户论坛】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/xxx/user-forum.png' 
    },
    { 
      id: TabType.NEWS, 
      label: '行业新闻', 
      slug: 'news',
      // 替换成你的【行业新闻】图标URL
      iconUrl: 'https://yixiaostudio.tos-cn-beijing.volces.com/xxx/industry-news.png' 
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen bg-white border-r border-gray-100 fixed left-0 top-0 z-50 p-6">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
             <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/images/icon-yixiao_ai.png" className="w-10 h-10" alt="logo" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              逸潇AI助手
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">yixiaostudio</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                  : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
            >
              {/* 2. 修复引号错误 + 使用自定义图标URL（核心修改） */}
              <img 
                src={item.iconUrl}  // 使用自定义图标URL
                className={`w-8 h-8 transition-transform group-hover:scale-110 ${activeTab === item.id ? 'brightness-0 invert scale-110' : ''}`}
                alt={item.label}
                // 容错：自定义图标加载失败时，自动用原来的icons8图标
                onError={(e) => {
                  e.target.src = getHandDrawnIcon(item.slug);
                }}
              />
              <span className="font-bold text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-50">
          <div className="bg-indigo-50 rounded-2xl p-4 flex items-center space-x-3 cursor-pointer hover:bg-indigo-100 transition-colors">
            <img src={getHandDrawnIcon('customer-support')} className="w-8 h-8" alt="support" />
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase">联系我们 9:30-20:00</p>
              <span className="text-xs font-bold text-indigo-900 leading-none">人类客服在线服务</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 px-2 py-2 flex justify-around items-center h-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] transition-all ${
              activeTab === item.id ? 'text-indigo-600 scale-110' : 'text-gray-400'
            }`}
          >
            {/* 3. 移动端也同步使用自定义图标URL（核心修改） */}
            <img 
              src={item.iconUrl} 
              className="w-7 h-7 mb-1" 
              alt={item.label}
              onError={(e) => {
                e.target.src = getHandDrawnIcon(item.slug);
              }}
            />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};

export default Navigation;