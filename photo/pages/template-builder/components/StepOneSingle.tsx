import React from 'react';

interface StepOneSingleProps {
  coverImage: string | null;
  isGenerating: boolean;
  prompt: string;
  setPrompt: (prompt: string) => void;
  handleGenerate: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRefImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  referenceImage: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  refFileInputRef: React.RefObject<HTMLInputElement | null>;
  onNext: () => void;
}

const StepOneSingle: React.FC<StepOneSingleProps> = ({
  coverImage,
  isGenerating,
  prompt,
  setPrompt,
  handleGenerate,
  handleImageUpload,
  handleRefImageUpload,
  referenceImage,
  fileInputRef,
  refFileInputRef,
  onNext
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 左侧区域：仅保留 AI 生成结果 + 生成建议 */}
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-black text-gray-700">AI 生成结果</label>
          <div className="relative group">
            <div 
              className={`
                aspect-[4/5] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all
                ${coverImage ? 'border-indigo-100' : 'border-gray-200'}
              `}
            >
              {coverImage ? (
                <img src={coverImage} className="w-full h-full object-cover" alt="preview" />
              ) : (
                <div className="text-center p-8">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-black text-gray-400">生成的图片将显示在这里</p>
                </div>
              )}
              
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-black text-indigo-600 animate-pulse">正在构思画面...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
          <h3 className="text-indigo-800 font-black text-sm flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            <span>生成建议</span>
          </h3>
          <p className="mt-2 text-xs text-indigo-700/80 font-medium leading-relaxed">
            尝试描述： "赛博朋克风格的少女，霓虹灯背景，电影质感，高对比度" 或 "中式古风，水墨画质感，淡雅色彩，意境深远"。
          </p>
        </div>
      </div>

      {/* 右侧区域：调整布局 → 描述输入 → 生成按钮 → 参考图 → 发布按钮 */}
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-black text-gray-700">描述你的模版风格</label>
          <textarea 
            rows={6}
            placeholder="输入文字描述，AI 将根据你的描述生成模版参考图..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium resize-none"
          />
        </div>

        <div className="flex flex-col space-y-6">
          {/* 立即生成测试按钮 */}
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-black transition-all flex items-center justify-center space-x-3 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{coverImage ? '重新生成测试' : '立即生成测试'}</span>
          </button>

          {/* 参考图（可选）：移到生成按钮下方 */}
          <div className="space-y-2">
            <label className="block text-sm font-black text-gray-700">参考图 (可选)</label>
            <div 
              onClick={() => refFileInputRef.current?.click()}
              className={`
                aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all cursor-pointer group
                ${referenceImage ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-gray-50 hover:border-indigo-400 hover:bg-white'}
              `}
            >
              {referenceImage ? (
                <div className="relative w-full h-full">
                  <img src={referenceImage} className="w-full h-full object-cover" alt="reference" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-black text-xs">更换参考图</span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4">
                  <svg className="w-6 h-6 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">点击上传参考图</p>
                </div>
              )}
            </div>
            <input type="file" ref={refFileInputRef} onChange={handleRefImageUpload} className="hidden" accept="image/*" />
          </div>

          {/* 满意去发布按钮 */}
          {coverImage && !isGenerating && (
            <button 
              onClick={onNext}
              className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3 animate-in zoom-in-95 duration-300"
            >
              <span>满意，去发布模版</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepOneSingle;