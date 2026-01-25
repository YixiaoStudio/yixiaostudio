
import React from 'react';
import { NewsItem } from '../types';

const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Gemini 2.0 Flash 正式发布：响应速度提升 300%，支持多模态实时交互',
    summary: 'Google 再次刷新大模型基准，全新的 Flash 模型不仅更小、更快，还原生支持了高频率的音频和视频流式处理，极大地拓宽了 AI 应用边界。',
    date: '2026-01-21',
    source: 'Google DeepMind',
    tag: '模型发布',
    url: 'https://deepmind.google/technologies/gemini/',
    imageUrl: 'https://loremflickr.com/600/300/ai,tech'
  },
  {
    id: 'n2',
    title: 'DeepSeek-V3 开源：引领国产大模型进入 500B 参数俱乐部',
    summary: '深度求索团队近日宣布开源其最新旗舰模型 V3，其在数学推理和编程能力上已能与国际顶尖闭源模型并驾齐驱，开源社区反响剧烈。',
    date: '2026-01-21',
    source: 'DeepSeek Blog',
    tag: '开源动向',
    url: 'https://www.deepseek.com/',
    imageUrl: 'https://loremflickr.com/600/300/network,technology'
  },
  {
    id: 'n3',
    title: 'OpenAI Sora 开始小规模内测：首批好莱坞导演评价“令人震撼”',
    summary: '虽然尚未全面公开，但首批试用 Sora 的视觉艺术家们分享的作品展示了极其惊人的光影效果和物理模拟一致性。',
    date: '2026-01-21',
    source: 'OpenAI News',
    tag: '视频创作',
    url: 'https://openai.com/sora',
    imageUrl: 'https://loremflickr.com/600/300/movie,video'
  },
  {
    id: 'n4',
    title: 'NVIDIA Blackwell GPU 量产加速，算力密度提升 25 倍',
    summary: '黄仁勋在最新的行业峰会上表示，Blackwell 架构不仅是硬件的飞跃，更是 AI 基础设施的重塑，将使万亿参数模型的训练成本降低 10 倍。',
    date: '2026-01-21',
    source: 'NVIDIA Newsroom',
    tag: '硬件革新',
    url: 'https://www.nvidia.com',
    imageUrl: 'https://loremflickr.com/600/300/chip,circuit'
  }
];

const NewsView: React.FC = () => {
  return (
    <div className="py-8 px-4 animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">AI 行业快讯</h2>
          <p className="text-gray-500 font-medium">聚焦全球最前沿的 AI 技术演进与商业动态</p>
        </div>
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs font-bold text-gray-600">内容自动抓取自 20+ 全球信源</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {MOCK_NEWS.map((news) => (
          <a 
            key={news.id} 
            href={news.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group"
          >
            <div className="relative h-60 overflow-hidden bg-gray-50">
              <img 
                src={news.imageUrl} 
                alt={news.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6">
                <span className="px-4 py-1.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                  {news.tag}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center space-x-3 text-xs font-bold text-gray-400 mb-4">
                <span className="text-indigo-600"># {news.source}</span>
                <span>•</span>
                <span>{news.date}</span>
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors leading-snug">
                {news.title}
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed mb-8 line-clamp-3">
                {news.summary}
              </p>
              
              <div className="flex items-center text-indigo-600 text-xs font-black uppercase tracking-widest group-hover:translate-x-2 transition-transform">
                <span>阅读原文</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="mt-20 p-12 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4 tracking-tight">想获取更多深度技术分享？</h3>
          <p className="text-indigo-100 mb-8 max-w-xl mx-auto font-medium">
            我们的社区成员每日都会分享最新的 AI 论文解读、Prompt 进阶指南以及行业深度报告。
          </p>
          <button className="px-10 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
            加入逸潇社区论坛
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsView;
