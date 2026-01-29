import React from 'react';
import { Template } from '../types';

// 仅接收props，不再包含任何业务逻辑
interface Props {
  template: Template;
  isGenerating: boolean;
  progress: number;
  generationStep: string;
  isCompleted: boolean;
  images: string[];
  uploadedImageUrl: string;
}

const SingleImageGenerator: React.FC<Props> = ({ 
  template, 
  isGenerating, 
  progress, 
  generationStep, 
  isCompleted, 
  images,
  uploadedImageUrl
}) => {
  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] border border-gray-100 relative overflow-hidden group min-h-[600px] flex flex-col">
      {/* 背景氛围光 */}
      <div className="absolute -top-24 -left-24 w-96 h-96 blur-[120px] opacity-10 rounded-full bg-indigo-400 transition-colors duration-1000" />
      
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-5 rounded-full bg-indigo-500" />
          <span className="text-gray-900 font-black tracking-widest text-xs uppercase">标准写真展示</span>
        </div>
        {isCompleted && (
          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[10px] font-black tracking-tighter animate-pulse">
            1份高清作品已导出
          </div>
        )}
      </div>

      <div className="flex-grow flex items-center justify-center w-full">
        <div className={`
          relative rounded-[1.5rem] overflow-hidden transition-all duration-1000 w-full max-w-[420px] aspect-[3/4]
          ${!isCompleted ? 'bg-gray-50/50 border-2 border-dashed border-gray-100' : 'shadow-[0_40px_80px_rgba(0,0,0,0.1)] hover:scale-[1.02] border border-gray-50'}
        `}>
          {isCompleted ? (
            <img src={images[0]} className="w-full h-full object-cover animate-fade-in" alt="result" />
          ) : isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px]">
              <div className="w-full h-full animate-[pulse_2s_infinite] bg-indigo-400/5" />
              <div className="absolute flex flex-col items-center">
                 <div className="flex space-x-1.5 mb-4">
                   <div className="w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.3s] bg-indigo-500 shadow-lg" />
                   <div className="w-2.5 h-2.5 rounded-full animate-bounce [animation-delay:-0.15s] bg-indigo-500 shadow-lg" />
                   <div className="w-2.5 h-2.5 rounded-full animate-bounce bg-indigo-500 shadow-lg" />
                 </div>
                 <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-white px-4 py-1.5 rounded-full shadow-md border border-indigo-50">
                   {generationStep}
                 </span>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl border border-gray-50 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <span className="text-gray-400 text-sm font-black uppercase tracking-[0.2em]">待生成区域</span>
                <span className="text-gray-200 text-[10px] font-bold tracking-widest">Waiting for Standard Shot</span>
              </div>
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-gray-100 rounded-tl-xl" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-gray-100 rounded-br-xl" />
            </div>
          )}
        </div>
      </div>

      {/* 仅保留状态展示，生成逻辑已移到父组件 */}
      {!isGenerating && uploadedImageUrl && !isCompleted && (
        <div className="absolute bottom-10 left-0 right-0 text-center px-10">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-50/80 rounded-full border border-gray-100 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-gray-400 text-xs font-black tracking-wide">
              点击右侧「生成单张写真」按钮开始创作
            </p>
          </div>
        </div>
      )}

      {!isGenerating && !isCompleted && !uploadedImageUrl && (
        <div className="absolute bottom-10 left-0 right-0 text-center px-10">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-gray-50/80 rounded-full border border-gray-100 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <p className="text-gray-400 text-xs font-black tracking-wide">
              点击右侧区域上传照片，然后点击生成按钮创作
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleImageGenerator;