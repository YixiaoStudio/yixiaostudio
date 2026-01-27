
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../constants';

const TemplateDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATES.find(t => t.id === id);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  if (!template) {
    return <div className="p-20 text-center">模版不存在</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const startGeneration = () => {
    if (!selectedFile) return;
    setIsGenerating(true);
    setProgress(0);
    
    const steps = [
      '正在检测面部区域...',
      '正在适配场景光效...',
      '正在优化皮肤纹理...',
      '正在合成高画质大图...',
      '九宫格智能排版中...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          setIsCompleted(true);
          return 100;
        }
        const newProgress = prev + 2; // 加快模拟进度
        if (newProgress % 20 === 0) {
          currentStep = Math.min(steps.length - 1, currentStep + 1);
          setGenerationStep(steps[currentStep]);
        }
        return newProgress;
      });
    }, 40);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left Side: Preview and Info */}
        <div className="space-y-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回浏览
          </button>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">{template.title}</h1>
            <p className="text-xl text-indigo-600 font-medium">{template.subtitle}</p>
            <p className="text-gray-500 leading-relaxed text-lg">
              {template.description}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-6 flex items-center">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full mr-3" />
              模版范例效果
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {template.exampleImages.map((img, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                  <img src={img} alt={`Example ${i}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Upload and Action */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-indigo-50 relative overflow-hidden">
            <h2 className="text-2xl font-bold mb-8 text-center">上传照片开始制作</h2>
            
            <div className="relative group">
              <label className={`
                flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-3xl cursor-pointer
                transition-all duration-300
                ${previewUrl ? 'border-indigo-400 bg-indigo-50/10' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
              `}>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isGenerating} />
                {previewUrl ? (
                  <div className="relative w-full h-full p-4">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-2xl shadow-lg" />
                    {!isGenerating && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                        <span className="text-white font-bold px-6 py-2 border-2 border-white rounded-full">更换照片</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <p className="mb-2 text-sm text-gray-500 font-semibold">点击上传生活照</p>
                    <p className="text-xs text-gray-400">推荐面部清晰的照片以获得最佳效果</p>
                  </div>
                )}
              </label>
            </div>

            <div className="mt-10">
              <button
                onClick={startGeneration}
                disabled={!selectedFile || isGenerating || isCompleted}
                className={`
                  w-full py-5 rounded-2xl text-xl font-black tracking-wider shadow-2xl transition-all flex items-center justify-center space-x-3
                  ${isGenerating 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{progress}% 处理中...</span>
                  </>
                ) : isCompleted ? (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>制作成功！</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>立即生成写真</span>
                  </>
                )}
              </button>
            </div>

            {isGenerating && (
              <div className="mt-6 space-y-3">
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-300 rounded-full animated-bg" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <p className="text-center text-indigo-600 font-medium text-sm">
                  {generationStep}
                </p>
              </div>
            )}
          </div>

          {isCompleted && (
            <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2rem] text-center space-y-6 animate-bounce-in">
              <h3 className="text-2xl font-bold text-emerald-800">制作已完成！</h3>
              <p className="text-emerald-600">您的写真大片已制作完毕，快去预览吧。</p>
              <div className="flex space-x-4">
                <button className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-colors">
                  预览并下载
                </button>
                <button 
                  onClick={() => {
                    setIsCompleted(false);
                    setPreviewUrl(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1 py-4 bg-white text-emerald-600 font-bold border border-emerald-200 rounded-2xl hover:bg-emerald-50 transition-colors"
                >
                  重新制作
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
