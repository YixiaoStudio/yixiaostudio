
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

// 本地知识库匹配逻辑
const getLocalResponse = (input: string): string => {
  const query = input.toLowerCase();
  
  if (query.includes('下载') || query.includes('获取') || query.includes('安装')) {
    return '您可以点击导航栏中的“下载中心”（如果适用）或直接前往 Typeless 官方网站 typeless.ai 获取最新版客户端。请注意，为保障安全，请勿从非官方渠道下载。';
  }
  if (query.includes('去水印')) {
    return '我们的“精选神器”板块提供“一键去水印”工具。它基于先进的图像修复算法，能够精准识别并移除图片或视频中的标志。您可以直接在精选神器板块启动体验。';
  }
  if (query.includes('pdf') || query.includes('转换')) {
    return 'PDF 格式转换工具位于“精选神器”中。它支持将 PDF 与 Word、Excel、PPT 相互转换，所有处理均在本地或安全云端完成，保护您的隐私。';
  }
  if (query.includes('抠图') || query.includes('背景')) {
    return '您可以试试“精选神器”里的“图片扣背景”。它可以自动识别主体并一键去除杂乱背景。';
  }
  if (query.includes('像素') || query.includes('8bit')) {
    return '“一键像素化”可以将您的普通照片变成复古艺术品，非常适合制作社交媒体头像。';
  }
  if (query.includes('收藏')) {
    return '在“工具广场”中，点击每个工具卡片右上角的星标即可完成收藏。您可以在“我的收藏”板块快速访问这些工具。';
  }
  if (query.includes('贡献') || query.includes('自建')) {
    return '如果您发现了好用的工具，欢迎在“自建AI池”中通过“提交我的 AI 应用”功能分享给社区用户。';
  }
  
  return '抱歉，目前的离线知识库中未匹配到相关信息。您可以尝试输入“去水印”、“PDF转换”、“下载”等关键字进行查询，或者在用户论坛发起讨论。';
};

const AIChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: '你好！我是逸潇工具箱的本地助手。为了确保您在离线状态下也能正常使用，我已切换至【本地知识库】模式。您可以咨询关于去水印、PDF转换、工具下载等相关问题。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    // 模拟本地响应延迟，增加真实感
    setTimeout(() => {
      const responseText = getLocalResponse(currentInput);
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto h-[70vh] flex flex-col bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden my-8">
      {/* Chat Header */}
      <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-2">
            <img src={getHandDrawnIcon('bot')} className="w-full h-full brightness-0 invert" alt="bot" />
          </div>
          <div>
            <h3 className="font-bold">本地知识助手</h3>
            <p className="text-xs text-slate-400">离线模式 · 实时反馈</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full border border-green-500/30">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
          <span>无需网络</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-br-none shadow-md' 
                : 'bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-none">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入关键字提问 (如: 去水印)..."
            className="flex-1 px-5 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="p-3 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 disabled:bg-slate-300 transition-colors shadow-lg shadow-slate-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatAssistant;
