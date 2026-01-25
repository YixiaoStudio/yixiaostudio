
import React from 'react';

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const DownloadSection: React.FC = () => {
  const platforms = [
    { name: 'Windows', slug: 'windows-10', color: 'bg-blue-500' },
    { name: 'macOS', slug: 'apple-logo', color: 'bg-gray-800' },
    { name: 'Linux', slug: 'linux', color: 'bg-orange-500' },
    { name: '浏览器扩展', slug: 'chrome', color: 'bg-emerald-500' },
  ];

  const officialUrl = 'https://typeless.ai';

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 text-sm font-medium rounded-full mb-4 border border-amber-100">
          <img src={getHandDrawnIcon('scales')} className="w-5 h-5" alt="legal" />
          <span>尊重著作权：本站仅提供官方链接</span>
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">前往官网获取 Typeless</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          为保障软件安全及您的合法权益，请始终通过 Typeless 官方渠道下载最新版客户端。
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {platforms.map((platform) => (
          <a
            key={platform.name}
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <div className={`w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform p-3`}>
              <img src={getHandDrawnIcon(platform.slug)} className="w-full h-full object-contain" alt={platform.name} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{platform.name}</h3>
            <div className="mt-auto w-full py-2.5 px-4 bg-gray-50 text-gray-700 font-semibold rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all flex items-center justify-center space-x-2">
              <span>前往官网下载</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-800 mb-2">版权与安全声明</h4>
            <p className="text-gray-500 text-sm leading-relaxed">
              “逸潇AI 助手”致力于为用户发现优质 AI 工具。我们坚决拥护原创及知识产权保护，不对任何第三方付费软件进行破解、分发或非法传播。所有工具推荐均指向开发者官方网站。请您在下载和使用过程中，遵守相关软件的最终用户许可协议（EULA）。
            </p>
          </div>
          <a 
            href={officialUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="whitespace-nowrap px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            访问 Typeless 官网
          </a>
        </div>
      </div>
    </div>
  );
};

export default DownloadSection;
