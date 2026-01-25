
import React from 'react';

const TypelessTutorial: React.FC = () => {
  const steps = [
    {
      title: '第一步：访问官网下载',
      content: '点击本页面的“获取客户端”或直接访问 typeless.ai。在官网根据您的系统选择对应的版本。安装完成后，首次运行请确保授予 Typeless 必要的系统访问权限（如辅助功能）。',
      image: 'https://loremflickr.com/800/400/sketch,computer'
    },
    {
      title: '第二步：设置唤醒快捷键',
      content: '打开 Typeless 设置面板，自定义你的“魔法键”（默认为 Option + Space）。这是你随时召唤 AI 助手的秘密通道。',
      image: 'https://loremflickr.com/800/400/drawing,keyboard'
    },
    {
      title: '第三步：输入并转换',
      content: '在任何输入框输入一段文字，按下快捷键。你可以输入指令，如“扩充这段话”或“翻译成英文”，Typeless 会立即在原地完成转换。',
      image: 'https://loremflickr.com/800/400/handdrawn,writing'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Typeless 简易上手教程</h2>
      <div className="space-y-12">
        {steps.map((step, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6 md:p-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-800">{step.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6">
                {step.content}
              </p>
              <img src={step.image} alt={step.title} className="w-full h-auto rounded-lg shadow-inner min-h-[200px] bg-gray-50 object-cover" />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 p-8 bg-indigo-50 rounded-2xl text-center">
        <h3 className="text-xl font-bold text-indigo-900 mb-2">准备好了吗？</h3>
        <p className="text-indigo-700 mb-6">现在就开始体验无感输入的魅力吧！</p>
        <button 
          onClick={() => window.open('https://typeless.ai', '_blank')}
          className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          前往官网获取
        </button>
      </div>
    </div>
  );
};

export default TypelessTutorial;
