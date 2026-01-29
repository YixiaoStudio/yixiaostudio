
import React from 'react';
import { Template } from '../types';

interface Props {
  isGenerating: boolean;
  progress: number;
  generationStep: string;
  isCompleted: boolean;
  images: string[];
  template: Template;
}

const GridImageGenerator: React.FC<Props> = ({ 
  isGenerating, 
  progress, 
  generationStep, 
  isCompleted, 
  images, 
  template 
}) => {
  return (
    <div className="bg-white rounded-[3rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-amber-100 relative overflow-hidden group min-h-[600px] flex flex-col">
      {/* 黄金氛围光 */}
      <div className="absolute -top-24 -left-24 w-96 h-96 blur-[120px] opacity-10 rounded-full bg-amber-400" />
      
      <div className="relative z-10 mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-1.5 h-5 rounded-full bg-amber-400" />
          <span className="text-amber-600 font-black tracking-widest text-xs uppercase">PREMIUM 九宫格全集</span>
        </div>
        {isCompleted && (
          <div className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-black tracking-tighter animate-pulse">
            9份作品已同步至画廊
          </div>
        )}
      </div>

      <div className="flex-grow grid grid-cols-3 gap-3">
        {(isCompleted ? images : (Array.from({ length: 9 }) as string[])).map((img, i) => (
          <div 
            key={i} 
            className={`
              relative rounded-[1.2rem] overflow-hidden transition-all duration-700 aspect-[3/4]
              ${!isCompleted ? 'bg-amber-50/30 border border-dashed border-amber-100' : 'shadow-lg hover:z-20 hover:scale-[1.05] border border-white'}
            `}
          >
            {isCompleted ? (
              <img src={img} className="w-full h-full object-cover animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }} alt="result" />
            ) : isGenerating ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full animate-[pulse_3s_infinite] bg-amber-400/10" style={{ animationDelay: `${i * 0.2}s` }} />
                <div className="absolute w-6 h-6 border-2 border-amber-200/50 rounded-full animate-spin border-t-amber-500" />
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                <svg className="w-6 h-6 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {!isGenerating && !isCompleted && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
           <div className="px-8 py-4 bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200 shadow-2xl flex flex-col items-center">
             <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
             </div>
             <p className="text-amber-800 font-black text-sm tracking-widest">高级写真待生成</p>
             <p className="text-amber-400 text-[10px] font-bold mt-1 uppercase">Ready for Multi-Shot Production</p>
           </div>
        </div>
      )}

      {isGenerating && (
         <div className="mt-6 flex items-center justify-center space-x-3">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
              AI正在矩阵渲染中: {generationStep}
            </span>
         </div>
      )}
    </div>
  );
};

export default GridImageGenerator;
