
import React, { useState, useRef } from 'react';
import { AppState, GeneratedImage, ProgressState } from './types';
import { UI_MESSAGES, SKI_PROMPTS } from './constants';
import { generateSkiImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [sourceData, setSourceData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [progress, setProgress] = useState<ProgressState>({ current: 0, total: 9, message: '' });
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  
  const isPausedRef = useRef(false);
  const stopSignalRef = useRef(false);
  const currentIndexRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenConfig = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && aistudio.openSelectKey) {
      await aistudio.openSelectKey();
      // 假设用户操作后 Key 已更新，重置错误状态
      setError(null);
      if (state === AppState.ERROR) setState(AppState.IDLE);
    }
  };

  const fileToData = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const res = reader.result as string;
        resolve({ base64: res.split(',')[1], mimeType: file.type || 'image/jpeg' });
      };
      reader.onerror = reject;
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setState(AppState.UPLOADING);
      const data = await fileToData(file);
      setSourceData(data);
      isPausedRef.current = false;
      stopSignalRef.current = false;
      currentIndexRef.current = 0;
      startGeneration(data.base64, data.mimeType, 0, []);
    } catch (err) {
      setError({ code: 'FILE_ERROR', message: "图片读取失败，请重试。" });
      setState(AppState.ERROR);
    }
  };

  const startGeneration = async (
    base64: string, 
    mimeType: string, 
    startIndex: number, 
    existingResults: GeneratedImage[]
  ) => {
    setState(AppState.GENERATING);
    const total = 9;
    const results = [...existingResults];

    for (let i = startIndex; i < total; i++) {
      if (stopSignalRef.current) return;
      if (isPausedRef.current) {
        currentIndexRef.current = i;
        setState(AppState.PAUSED);
        return;
      }

      try {
        setProgress({ 
          current: i + 1, 
          total, 
          message: UI_MESSAGES.GEN_PROGRESS(i + 1, total) 
        });
        
        const imageUrl = await generateSkiImage(base64, mimeType, i);
        results.push({ id: `img-${i}`, url: imageUrl, prompt: SKI_PROMPTS[i] });
        setGeneratedImages([...results]);
      } catch (err: any) {
        if (err.message === 'INVALID_KEY' || err.message === 'MISSING_KEY') {
          setError({ code: 'AUTH_ERROR', message: "API 密钥无效或未配置。请点击下方按钮重新授权。" });
          setState(AppState.ERROR);
          return;
        }
        
        // 其他非致命错误尝试继续（或在此可添加重试逻辑）
        console.error("Single generation error:", err);
        if (results.length === 0 && i === 0) {
          setError({ code: 'GEN_ERROR', message: err.message });
          setState(AppState.ERROR);
          return;
        }
      }
    }

    if (results.length > 0) {
      setState(AppState.COMPLETED);
    } else {
      setError({ code: 'GEN_ERROR', message: "生成失败，请检查网络或更换照片。" });
      setState(AppState.ERROR);
    }
  };

  const togglePause = () => {
    if (state === AppState.GENERATING) {
      isPausedRef.current = true;
    } else if (state === AppState.PAUSED) {
      isPausedRef.current = false;
      if (sourceData) {
        startGeneration(sourceData.base64, sourceData.mimeType, currentIndexRef.current, generatedImages);
      }
    }
  };

  const reset = () => {
    setState(AppState.IDLE);
    setSourceData(null);
    setGeneratedImages([]);
    setError(null);
    isPausedRef.current = false;
    stopSignalRef.current = false;
    currentIndexRef.current = 0;
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const saveToGallery = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ski_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center">
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
            <i className="fas fa-snowflake text-lg"></i>
          </div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">AI滑雪实验室</h1>
        </div>
        {state !== AppState.IDLE && (
          <button onClick={reset} className="text-blue-600 font-bold text-sm">返回首页</button>
        )}
      </header>

      <main className="w-full max-w-md px-6 pt-10">
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-black text-slate-900 leading-tight">刷爆朋友圈的<br/>滑雪大片</h2>
              <p className="text-slate-400 text-sm">{UI_MESSAGES.SUBTITLE}</p>
            </div>

            <div className="w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 border border-white flex flex-col items-center p-10 text-center space-y-8">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-4xl">
                <i className="fas fa-camera-retro"></i>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-slate-800 text-xl">上传照片</p>
                <p className="text-xs text-slate-400 px-4">建议上传正脸、光线充足的照片</p>
              </div>
              <label className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold cursor-pointer hover:bg-blue-700 active:scale-[0.98] transition-all shadow-xl shadow-blue-200 block text-center">
                立即开始制作
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        )}

        {(state === AppState.GENERATING || state === AppState.UPLOADING || state === AppState.PAUSED) && (
          <div className="flex flex-col items-center space-y-10 pt-6">
            <div className="relative">
              <div className={`w-36 h-36 border-[6px] border-white border-t-blue-600 rounded-full shadow-inner ${state === AppState.GENERATING ? 'animate-spin' : ''}`}></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-black text-blue-600">{Math.round((progress.current / progress.total) * 100)}%</span>
                {state === AppState.PAUSED && <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">已暂停</span>}
              </div>
            </div>

            <div className="text-center space-y-3 px-6">
              <p className="text-xl font-black text-slate-900 leading-tight">
                {state === AppState.PAUSED ? '生成已暂停' : progress.message}
              </p>
              <div className="flex space-x-3 justify-center">
                <button onClick={togglePause} className="px-6 py-2 bg-slate-100 text-slate-600 rounded-full text-sm font-bold flex items-center space-x-2">
                  <i className={`fas ${state === AppState.PAUSED ? 'fa-play' : 'fa-pause'}`}></i>
                  <span>{state === AppState.PAUSED ? '继续生成' : '暂停生成'}</span>
                </button>
                {state === AppState.PAUSED && (
                  <button onClick={reset} className="px-6 py-2 bg-white text-red-500 border border-red-50 rounded-full text-sm font-bold">放弃</button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full p-3 bg-white rounded-3xl shadow-inner border border-slate-50">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square bg-slate-50 rounded-xl overflow-hidden border border-slate-100 flex items-center justify-center">
                  {generatedImages[i] ? (
                    <img src={generatedImages[i].url} className="w-full h-full object-cover animate-fade-in" alt="result" />
                  ) : (
                    <div className={`w-1.5 h-1.5 bg-blue-200 rounded-full ${state === AppState.GENERATING && i === generatedImages.length ? 'animate-ping' : ''}`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {state === AppState.COMPLETED && (
          <div className="space-y-10 animate-fade-in-up pb-12">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-2 rounded-full text-xs font-bold mb-4">
                <i className="fas fa-check-circle"></i>
                <span>九宫格已完成</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">属于您的滑雪大片</h2>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-white rounded-[2rem] shadow-2xl border border-white overflow-hidden">
              {generatedImages.map((img) => (
                <div key={img.id} className="aspect-square relative active:scale-95 transition-transform">
                  <img src={img.url} className="w-full h-full object-cover rounded-xl" alt="skiing" />
                  <button onClick={() => saveToGallery(img.url, img.id)} className="absolute bottom-1.5 right-1.5 w-8 h-8 bg-white/90 text-blue-600 rounded-full flex items-center justify-center text-xs shadow-lg backdrop-blur-sm">
                    <i className="fas fa-download"></i>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => generatedImages.forEach(img => saveToGallery(img.url, img.id))} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 flex items-center justify-center space-x-3">
              <i className="fas fa-th"></i>
              <span>保存全部九宫格图片</span>
            </button>
          </div>
        )}

        {state === AppState.ERROR && (
          <div className="text-center space-y-8 pt-10 animate-fade-in">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
              <i className="fas fa-key"></i>
            </div>
            <div className="space-y-4 px-2">
              <h3 className="text-xl font-bold text-slate-800">密钥授权问题</h3>
              <div className="p-5 bg-white rounded-2xl border border-red-100 shadow-sm">
                <p className="text-sm text-red-600 leading-relaxed">{error?.message}</p>
              </div>
              <div className="flex flex-col space-y-3">
                {error?.code === 'AUTH_ERROR' && (
                  <button onClick={handleOpenConfig} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100">
                    点击此处配置 API Key
                  </button>
                )}
                <button onClick={reset} className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">
                  放弃并返回
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-10 text-center px-6">
        <p className="text-slate-300 text-[10px] tracking-[0.5em] font-medium uppercase">AI Skiing Vacation Studio</p>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 1, 0.2, 1) forwards; }
      `}} />
    </div>
  );
};

export default App;
