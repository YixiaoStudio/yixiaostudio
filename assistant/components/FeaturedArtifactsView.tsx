import React, { useState, useEffect } from 'react';
import { FEATURED_ARTIFACTS_TOOLS } from '../constants';

// 核心修改：定义所有工具的自定义图标URL映射表
const toolIconMap: Record<string, string> = {
  'watermark-remover': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/watermark-remover.png', // 一键去水印（保留你原有的URL）
  'pixelator': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/pixelate-tool.png', // 一键像素化（替换成你的URL）
  'pdf-convert': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/pdf-conversion.png', // PDF格式转换（替换成你的URL）
  'bg-remove': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/bg-remover.png', // 图片扣背景（替换成你的URL）
  'quick-collage': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/quick-puzzle-tool.png', // 快速拼图（替换成你的URL）
  'icon-generator': 'https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/icon-generator.png', // 图标生成器（替换成你的URL）
};

// 保留原函数（作为备用，若有新增工具未配置自定义URL时使用）
const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const FeaturedArtifactsView: React.FC = () => {
  const [clickCounts, setClickCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedCounts = localStorage.getItem('yixiao_ai_tool_clicks');
    if (savedCounts) setClickCounts(JSON.parse(savedCounts));
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

  return (
    <div className="py-8 px-4 animate-fade-in max-w-7xl mx-auto">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4 border border-purple-100">
            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
            <span>Lab Artifacts</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">逸潇自研 · 精选神器</h2>
          <p className="text-gray-500 font-medium max-w-xl">我们针对日常办公与创意设计的痛点，倾力打造的一系列极简、高效的AI原生小工具。</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-gray-50 shadow-sm">
          <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/member.png" className="w-10 h-10" alt="quality" />
          <div className="text-xs">
            <p className="font-bold text-gray-800">100% 永久免费</p>
            <p className="text-gray-400">逸潇会员专属特权</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {FEATURED_ARTIFACTS_TOOLS.map((tool) => {
          const clicks = clickCounts[tool.id] || 0;
          return (
            <div key={tool.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex justify-between items-start mb-8 relative z-10">
                 {/* 👇👇👇 这里是图标框放大的地方 👇👇👇 */}
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center p-4 group-hover:scale-110 transition-transform shadow-inner">
                  {/* 核心修改：引用自定义图标映射表，无配置则用默认图标 */}
                  <img
                    src={toolIconMap[tool.id] || getHandDrawnIcon(tool.icon)}
                    className="w-full h-full object-contain scale-150"
                    alt={tool.name}
                  />
                </div>
                <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black rounded-xl uppercase tracking-wider">
                  Self-R&D
                </span>
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2 relative z-10">{tool.name}</h3>
              <p className="text-sm text-gray-500 mb-10 leading-relaxed relative z-10 flex-1">
                {tool.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50 relative z-10">
                <div className="flex items-center space-x-2">
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/popularity.png" className="w-5 h-5" alt="hot" />
                  <span className="text-xs font-black text-slate-800">{clicks}</span>
                </div>
                <button
                  onClick={() => handleToolClick(tool.id)}
                  className="px-6 py-3 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-indigo-600 transition-all flex items-center space-x-2"
                >
                  <img src="https://yixiaostudio.tos-cn-beijing.volces.com/github-pages-templates/yixiaostudio.cn/Yixiao-AI-Assistant/go.png" className="w-4 h-4 brightness-0 invert" alt="run" />
                  <span>立即体验</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-20 p-10 bg-slate-50 rounded-[3rem] border border-dashed border-gray-300 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center space-x-6">
          <img src={getHandDrawnIcon('idea')} className="w-20 h-20" alt="more-coming" />
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-1">更多神器正在内测中...</h4>
            <p className="text-sm text-gray-500">“一键生成PPT”、“长文总结神器”即将上线，敬请期待。</p>
          </div>
        </div>
        <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black text-sm hover:border-indigo-600 hover:text-indigo-600 transition-all">
          提交工具建议
        </button>
      </div>
    </div>
  );
};

export default FeaturedArtifactsView;