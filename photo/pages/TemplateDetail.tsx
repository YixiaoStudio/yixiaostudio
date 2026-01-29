// src/pages/TemplateDetail.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../constants';
import { GalleryItem, UploadHistoryItem } from '../types';
import SingleImageGenerator from '../components/SingleImageGenerator';
import GridImageGenerator from '../components/GridImageGenerator';
import { PointsProfile } from '../components/PointsManager';

// API配置
const VOLC_API_BASE = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com'; 
const UPLOAD_API = VOLC_API_BASE + '/api/upload-to-tos';
const GENERATE_API = VOLC_API_BASE + '/api/generate-image';
const CONVERTER_API = VOLC_API_BASE + '/api/get-prompt-by-code';

// 🔥 1. 定义Props接口，接收后端扣减方法和积分数据
interface TemplateDetailProps {
  deductCredits: (num?: number) => Promise<boolean>; // 扣减积分方法
  deductRose: () => Promise<boolean>;                // 扣减玫瑰方法
  profile: PointsProfile;                            // 后端积分数据（用于前端判断）
  profileLoading: boolean;                           // 积分加载状态
}

// 🔥 2. 接收Props
const TemplateDetail: React.FC<TemplateDetailProps> = ({ 
  deductCredits, 
  deductRose,
  profile,
  profileLoading
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATES.find(t => t.id === id);
  
  // 🔥 3. 删除本地localStorage积分操作（改用后端profile）
  // 移除 getProfile 和 updateProfile 函数

  // 基础状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState<string>('准备生成');
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isPlus, setIsPlus] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<UploadHistoryItem | null>(null);
  const requestIdRef = useRef<string>('');

  if (!template) {
    return <div className="p-20 text-center font-bold text-gray-500 italic">模版未找到...</div>;
  }

  // 组件挂载加载历史上传记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ai-upload-history');
      if (savedHistory) {
        const parsedHistory: UploadHistoryItem[] = JSON.parse(savedHistory);
        parsedHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setUploadHistory(parsedHistory);
      }
    } catch (err) {
      console.error('加载上传历史失败:', err);
    }
  }, []);

  // 调试日志
  const addDebugLog = useCallback((msg: string) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  }, []);

  // 保存上传记录到localStorage
  const saveUploadHistory = useCallback((file: File, base64Url: string, tosUrl: string) => {
    const newItem: UploadHistoryItem = {
      id: Date.now().toString(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      base64Url: base64Url,
      tosUrl: tosUrl,
      timestamp: new Date().toISOString()
    };
    const noDuplicateHistory = [newItem, ...uploadHistory.filter(item => item.tosUrl !== tosUrl)];
    const limitedHistory = noDuplicateHistory.slice(0, 10);
    setUploadHistory(limitedHistory);
    localStorage.setItem('ai-upload-history', JSON.stringify(limitedHistory));
  }, [uploadHistory]);

  // 选择历史上传图片
  const selectFromHistory = useCallback((item: UploadHistoryItem) => {
    setSelectedHistoryItem(item);
    setSelectedFile(null);
    setPreviewUrl(item.base64Url);
    setUploadedImageUrl(item.tosUrl);
    setIsCompleted(false);
    setGeneratedImages([]);
    setGenerationStep('✅ 已选择历史图片，点击生成按钮开始创作');
    addDebugLog(`选择历史图片：${item.fileName}`);
  }, [addDebugLog]);

  // 删除单条历史上传记录
  const deleteHistoryItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条上传记录吗？')) {
      const updatedHistory = uploadHistory.filter(item => item.id !== id);
      setUploadHistory(updatedHistory);
      localStorage.setItem('ai-upload-history', JSON.stringify(updatedHistory));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
        setPreviewUrl(null);
        setUploadedImageUrl('');
        setGenerationStep('准备生成');
      }
    }
  }, [uploadHistory, selectedHistoryItem]);

  // 调用提示词转换服务
  const getPromptByCode = useCallback(async (code: string): Promise<string | string[]> => {
    try {
      addDebugLog(`开始获取提示词，编号：${code}`);
      const res = await fetch(CONVERTER_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (data.code === 0) {
        return data.data;
      } else {
        throw new Error(`获取提示词失败：${data.message}`);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      addDebugLog(`获取提示词异常：${errorMessage}`);
      throw err;
    }
  }, [addDebugLog]);

  // 文件转Base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }, []);

  // 上传图片到TOS
  const uploadImageToTOS = useCallback(async (base64Str: string, file: File) => {
    try {
      setGenerationStep('正在上传图片到服务器...');
      addDebugLog('开始上传图片');
      const res = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Str })
      });
      const data = await res.json();
      if (data.code === 0) {
        const imageUrl = data.data.imageUrl;
        setUploadedImageUrl(imageUrl);
        setGenerationStep('✅ 图片上传成功！点击生成按钮开始创作');
        addDebugLog(`上传成功，TOS URL：${imageUrl}`);
        saveUploadHistory(file, base64Str, imageUrl);
        return imageUrl;
      } else {
        throw new Error(`上传失败：${data.message}`);
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      setErrorMsg(errorMessage);
      addDebugLog(`上传异常：${errorMessage}`);
      throw err;
    }
  }, [addDebugLog, saveUploadHistory]);

  // 处理新文件上传
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedHistoryItem(null);
    setSelectedFile(file);
    setIsCompleted(false);
    setGeneratedImages([]);
    setProgress(0);
    const tempPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(tempPreviewUrl);

    try {
      const base64Str = await fileToBase64(file);
      await uploadImageToTOS(base64Str, file);
      URL.revokeObjectURL(tempPreviewUrl);
    } catch (err) {
      alert((err as Error).message);
      setPreviewUrl(null);
      setSelectedFile(null);
      URL.revokeObjectURL(tempPreviewUrl);
    }
  }, [fileToBase64, uploadImageToTOS]);

  // 调用生成API
  const callGenerateApi = useCallback(async (tag: string, imageUrl: string): Promise<string> => {
    const requestId = `single_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    requestIdRef.current = requestId;
    
    return new Promise((resolve, reject) => {
      fetch(GENERATE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: tag, imageUrl, requestId })
      })
      .then(async response => {
        addDebugLog(`接口响应状态[${requestId}]：${response.status}`);
        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`HTTP${response.status}：${errText}`);
        }

        try {
          const data = await response.json();
          if (data.code === 0 && data.data && data.data.length > 0) {
            resolve(data.data[0].url);
          } else if (data.url) {
            resolve(data.url);
          } else {
            reject(new Error('未找到图片URL'));
          }
        } catch (e) {
          const reader = response.body?.getReader();
          if (!reader) reject(new Error('无法获取响应流'));
          const decoder = new TextDecoder('utf-8');
          let resultImageUrl = '';

          const readStream = async () => {
            if (requestIdRef.current !== requestId) { reader.cancel(); reject(new Error('请求已过期')); return; }
            const { done, value } = await reader.read();
            if (done) {
              resultImageUrl ? resolve(resultImageUrl) : reject(new Error('流式解析未找到图片URL'));
              return;
            }
            const chunk = decoder.decode(value, { stream: true });
            chunk.split('\n').filter(line => line.trim()).forEach(line => {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') return;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.url) {
                    resultImageUrl = data.url;
                    setProgress(prev => Math.min(prev + 10, 100));
                  }
                } catch (err) { addDebugLog(`解析单行失败[${requestId}]：${(err as Error).message}`); }
              }
            });
            readStream();
          };
          readStream();
        }
      })
      .catch(err => reject(new Error(`生成失败：${(err as Error).message}`)));
    });
  }, [addDebugLog]);

  // 保存生成的图片到图库
  const saveToGallery = useCallback((images: string[]) => {
    if (images.length === 0) return;
    const saved: GalleryItem[] = JSON.parse(localStorage.getItem('ai-photo-gallery') || '[]');
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      templateId: template.id,
      templateTitle: template.title,
      images,
      timestamp: new Date().toISOString(),
      isPlus,
      originalImage: { tosUrl: uploadedImageUrl, source: selectedHistoryItem ? 'history' : 'upload' }
    };
    localStorage.setItem('ai-photo-gallery', JSON.stringify([newItem, ...saved]));
    addDebugLog(`生成成功！${images.length}张图片已自动保存到图库`);
  }, [template.id, template.title, isPlus, uploadedImageUrl, selectedHistoryItem, addDebugLog]);

  // 启动生成（🔥 核心修改：替换为调用后端扣减方法）
  const startGeneration = useCallback(async () => {
    // 积分加载中，禁止操作
    if (profileLoading) {
      alert('积分数据加载中，请稍等！');
      return;
    }
    if (!uploadedImageUrl) { 
      alert('请先上传图片或选择历史图片！'); 
      return; 
    }
    if (isGenerating) { 
      alert('正在生成图片，请稍等！'); 
      return; 
    }

    // 从后端profile获取最新积分数据
    const currentCredits = profile.credits || 0;
    const currentRoses = profile.crystalRoses || 0;
    const isPlusMember = profile.isPlusMember || false;
    let deductSuccess = false;
    let deductMessage = '';

    // 🔥 4. 替换扣减逻辑：调用后端方法，而非本地操作
    // 4.1 单张生成：扣1个积分点
    if (!isPlus) {
      if (currentCredits < 1) {
        alert(`积分不足！
生成单张需要1个积分点。
可点击顶部积分图标领取每日10个积分点，或完成任务获取更多。`);
        return;
      }
      // 调用后端扣减积分方法
      deductSuccess = await deductCredits(1);
      if (!deductSuccess) {
        addDebugLog('[生成失败] 积分扣减失败');
        return;
      }
      deductMessage = `已扣减1个积分点，剩余${currentCredits - 1}个`;
    } 
    // 4.2 九宫格生成：优先扣玫瑰
    else {
      if (currentRoses >= 1) {
        // 调用后端扣减玫瑰方法
        deductSuccess = await deductRose();
        if (!deductSuccess) {
          addDebugLog('[生成失败] 玫瑰扣减失败');
          return;
        }
        deductMessage = `已使用1朵水晶玫瑰，剩余${currentRoses - 1}朵`;
      } else {
        if (!isPlusMember) {
          alert(`无法生成九宫格！
水晶玫瑰不足且未开通PLUS会员。
1朵水晶玫瑰可免费生成1次九宫格，或开通PLUS会员使用9积分点生成。`);
          return;
        }
        if (currentCredits < 9) {
          alert(`积分不足！
PLUS会员生成九宫格需要9个积分点，当前仅有${currentCredits}个。
可点击顶部积分图标领取每日10个积分点，或完成任务获取更多。`);
          return;
        }
        // 调用后端扣减9个积分
        deductSuccess = await deductCredits(9);
        if (!deductSuccess) {
          addDebugLog('[生成失败] 积分扣减失败');
          return;
        }
        deductMessage = `已扣减9个积分点，剩余${currentCredits - 9}个`;
      }
    }

    if (deductSuccess) {
      addDebugLog(deductMessage);
    }

    try {
      setIsGenerating(true);
      setIsCompleted(false);
      setProgress(0);
      setErrorMsg('');
      setGeneratedImages([]);
      setGenerationStep('AI正在绘制您的写真');

      const promptCode = `${isPlus ? 'G' : 'S'}${template.id}`;
      addDebugLog(`生成模式：${isPlus ? '九宫格' : '单张'}，提示词编号：${promptCode}`);
      const promptData = await getPromptByCode(promptCode);
      let actualGeneratedImages: string[] = [];

      // 单张生成
      if (!isPlus) {
        const generatedImageUrl = await callGenerateApi(promptData as string, uploadedImageUrl);
        actualGeneratedImages = [generatedImageUrl];
        setProgress(100);
      } 
      // 九宫格生成
      else {
        const gridPrompts = promptData as string[];
        setGenerationStep('九宫格生成中（共9张）...');
        const generatePromises = gridPrompts.map((prompt, index) => 
          callGenerateApi(prompt, uploadedImageUrl).catch(err => {
            addDebugLog(`九宫格第${index+1}张生成失败：${(err as Error).message}`);
            return '';
          })
        );
        const results = await Promise.all(generatePromises);
        actualGeneratedImages = results.filter(url => url);
        setProgress(100);
        setGenerationStep(actualGeneratedImages.length < 9 
          ? `✅ 九宫格生成完成（${actualGeneratedImages.length}/9张成功）` 
          : '✅ 九宫格生成完成！'
        );
      }

      // 生成成功
      setGeneratedImages(actualGeneratedImages);
      setIsCompleted(true);
      setIsGenerating(false);
      saveToGallery(actualGeneratedImages);

    } catch (err) {
      const errorMessage = (err as Error).message;
      setErrorMsg(errorMessage);
      setIsGenerating(false);
      setGenerationStep(`❌ 生成失败：${errorMessage}`);
      addDebugLog(`生成异常：${errorMessage}`);
      
      // 🔥 5. 生成失败无需本地恢复（后端扣减接口应保证：仅生成成功才扣减，失败则不扣减）
      alert(`生成失败！错误信息：${errorMessage}`);
    }
  }, [
    uploadedImageUrl, isGenerating, isPlus, template.id, 
    getPromptByCode, callGenerateApi, saveToGallery, addDebugLog,
    // 🔥 新增依赖：后端扣减方法和积分数据
    deductCredits, deductRose, profile, profileLoading
  ]);

  // 解锁PLUS九宫格模式
  const unlockPlus = () => {
    if (isGenerating) return;
    setIsUnlocking(true);
    setTimeout(() => {
      setIsPlus(true);
      // 🔥 注意：PLUS会员状态需从后端获取，此处仅前端展示，实际需调用后端接口
      setIsUnlocking(false);
      setIsCompleted(false);
      setGeneratedImages([]);
      addDebugLog('已解锁PLUS会员，可使用九宫格积分生成模式');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      {/* 头部导航 */}
      <div className="bg-white/50 backdrop-blur-md sticky top-16 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navigate('/')}
              className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all group"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="h-10 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">{template.title}</h1>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em]">{template.category}写真系列</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
             {template.tags.map(tag => (
               <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black rounded-lg">#{tag}</span>
             ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* 生成结果展示区 */}
          <div className="lg:col-span-7">
            {isPlus ? (
              <GridImageGenerator 
                isGenerating={isGenerating} progress={progress} generationStep={generationStep}
                isCompleted={isCompleted} images={generatedImages} template={template}
                uploadedImageUrl={uploadedImageUrl}
              />
            ) : (
              <SingleImageGenerator 
                isGenerating={isGenerating} progress={progress} generationStep={generationStep}
                isCompleted={isCompleted} images={generatedImages} template={template}
                uploadedImageUrl={uploadedImageUrl}
              />
            )}
            <div className="mt-6 bg-white rounded-3xl p-6 border border-gray-100 flex items-center justify-between shadow-sm">
               <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                 </div>
                 <p className="text-xs text-gray-400 font-medium max-w-sm">模版说明：{template.description}</p>
               </div>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div className="lg:col-span-5 space-y-8">
            {/* 生成模式选择 */}
            <div className={`relative p-8 rounded-[2.5rem] transition-all duration-500 overflow-hidden
              ${isPlus ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-amber-100' 
                : 'bg-white border-gray-100 shadow-xl shadow-gray-100/50 border-2'}`}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black text-gray-900">选择生成模式</h3>
                {isPlus && <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-1 rounded-lg">PLUS+ 已解锁</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <button 
                  onClick={() => !isGenerating && setIsPlus(false)}
                  className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32
                    ${!isPlus ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Standard</span>
                  <span className="text-sm font-black">生成 1 张写真 <span className="text-xs opacity-80">(消耗1积分点)</span></span>
                </button>
                <div className="relative group">
                  <button 
                    onClick={() => !isGenerating && (isPlus ? setIsPlus(true) : unlockPlus())}
                    disabled={isUnlocking || isGenerating}
                    className={`p-5 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32 w-full
                      ${isPlus ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-transparent text-black shadow-lg shadow-amber-200' 
                        : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-white hover:border-amber-400'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Premium</span>
                      {!isPlus && <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>}
                    </div>
                    <div>
                      <span className="text-sm font-black block">九宫格生成 
                        <span className="text-xs opacity-80">
                          {(profile.crystalRoses || 0) > 0 ? '(消耗1玫瑰)' : '(PLUS会员消耗9积分点)'}
                        </span>
                      </span>
                      {isUnlocking && <div className="mt-1 w-full h-1 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-black animate-[shimmer_1s_infinite]" />
                      </div>}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* 上传区 + 历史上传 */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100/50 border border-gray-50">
              {/* 历史上传图片展示 */}
              {uploadHistory.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-sm font-black text-gray-900 mb-3">最近上传（点击直接使用）</h4>
                  <div className="grid grid-cols-3 gap-3 max-h-32 overflow-y-auto pb-2">
                    {uploadHistory.map(item => (
                      <div 
                        key={item.id}
                        onClick={() => selectFromHistory(item)}
                        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all
                          ${selectedHistoryItem?.id === item.id ? 'ring-2 ring-indigo-500 ring-offset-2' : 'border border-gray-100 hover:border-indigo-300'}`}
                      >
                        <img src={item.base64Url} alt={item.fileName} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-black truncate">{item.fileName}</span>
                        </div>
                        <button 
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          className="absolute top-1 right-1 p-1 bg-rose-500 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 新文件上传按钮 */}
              <label className={`relative block group cursor-pointer rounded-[2rem] overflow-hidden border-4 border-dashed transition-all duration-500
                ${previewUrl ? 'border-indigo-500/20 aspect-square' : 'border-gray-100 bg-gray-50/50 hover:bg-white hover:border-indigo-300 aspect-video'}`}>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isGenerating} />
                {previewUrl ? (
                  <img src={previewUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="upload-preview" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-600">
                     <svg className="w-10 h-10 mb-2 transition-transform group-hover:-translate-y-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                     </svg>
                     <span className="text-xs font-black uppercase tracking-widest">选择照片</span>
                  </div>
                )}
              </label>

              {/* 生成按钮 */}
              <div className="mt-10 space-y-4">
                <button 
                  onClick={startGeneration}
                  disabled={!uploadedImageUrl || isGenerating || profileLoading}
                  className={`w-full py-6 rounded-3xl text-lg font-black tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3
                    ${isGenerating || profileLoading ? 'bg-gray-100 text-gray-400 cursor-wait' 
                      : isPlus ? 'bg-black text-white hover:bg-gray-900 shadow-amber-100' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                >
                  {isGenerating ? (
                    <>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                      </div>
                      <span className="ml-4">{progress}% 处理中</span>
                    </>
                  ) : profileLoading ? (
                    <>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" />
                      </div>
                      <span className="ml-4">加载积分数据...</span>
                    </>
                  ) : (
                    <>
                      <span>{isPlus ? '立即生成九宫格' : '生成单张写真'}</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7m0 0l-7 7m7-7H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 生成成功提示区 */}
            {isCompleted && generatedImages.length > 0 && (
              <div className="bg-emerald-500 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-emerald-100 animate-[fadeInUp_0.6s_ease-out]">
                 <h4 className="text-xl font-black mb-2">生成成功！已自动保存到图库</h4>
                 <p className="text-emerald-100 text-xs font-medium mb-6">可继续在当前模版生成新图片，或前往图库查看/下载作品</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = generatedImages[0];
                        a.download = `${template.title}_${Date.now()}.jpg`;
                        a.click();
                      }}
                      className="py-4 bg-white text-emerald-600 font-black rounded-2xl text-xs hover:shadow-lg transition-all active:scale-95"
                    >
                      立即下载图片
                    </button>
                    <button 
                      onClick={() => navigate('/gallery')}
                      className="py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs hover:bg-emerald-700 transition-all active:scale-95"
                    >
                      前往我的图库
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: scale(1.05); filter: blur(10px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        .animate-fade-in { animation: fade-in 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default TemplateDetail;