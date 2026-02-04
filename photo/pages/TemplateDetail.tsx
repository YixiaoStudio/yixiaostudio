import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TEMPLATES } from '../constants';
import { GalleryItem, UploadHistoryItem } from '../types';
import SingleImageGenerator from '../components/SingleImageGenerator';
import GridImageGenerator from '../components/GridImageGenerator';
import { PointsProfile } from '../components/PointsManager';
import { PointsRefreshContext } from '../App';
import { saveGeneratedImageToServer } from './MyGallery';

// ========== 新增：子组件Props类型定义（解决属性未定义问题） ==========
type ImageGeneratorCommonProps = {
  isGenerating: boolean;
  progress: number;
  generationStep: string;
  isCompleted: boolean;
  images: string[];
  template: typeof TEMPLATES[0];
  uploadedImageUrl: string;
  onImageClick?: (imageUrl: string) => void; // 新增onImageClick属性定义
};

// 类型断言：确保子组件接收onImageClick属性（如果子组件未定义，先临时断言）
const SingleImageGeneratorWithClick = SingleImageGenerator as React.FC<ImageGeneratorCommonProps>;
const GridImageGeneratorWithClick = GridImageGenerator as React.FC<ImageGeneratorCommonProps>;

// API配置（原有代码不变）
const VOLC_API_BASE = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com'; 
const UPLOAD_API = VOLC_API_BASE + '/api/upload-to-tos';
const GENERATE_API = VOLC_API_BASE + '/api/generate-image';
const CONVERTER_API = VOLC_API_BASE + '/api/get-prompt-by-code';
const USER_IMAGES_API = VOLC_API_BASE + '/api/get-user-images';
const POINTS_API_BASE_URL = 'https://sd5r3ie17n7a7iuta91j0.apigateway-cn-beijing.volceapi.com/api/points';

// ========== 临时方案：接口未实现时的降级处理（原有代码不变） ==========
const restoreCreditsApi = async (userId: number, num: number, requestId: string): Promise<boolean> => {
  console.warn(`[临时提示] 恢复积分接口未实现（404），userId:${userId}, num:${num}, requestId:${requestId}`);
  localStorage.setItem(`restore_credits_${Date.now()}`, JSON.stringify({
    userId, num, requestId, time: new Date().toISOString()
  }));
  return false;
};

const restoreRoseApi = async (userId: number, requestId: string): Promise<boolean> => {
  console.warn(`[临时提示] 恢复玫瑰接口未实现（404），userId:${userId}, requestId:${requestId}`);
  localStorage.setItem(`restore_rose_${Date.now()}`, JSON.stringify({
    userId, requestId, time: new Date().toISOString()
  }));
  return false;
};

// ========== 工具函数（原有代码不变） ==========
const requestPointsApi = async (userId: number, url: string, options: RequestInit = {}) => {
  try {
    const userIdStr = String(userId);
    const timestamp = new Date().getTime();
    const fullUrl = `${POINTS_API_BASE_URL}${url}?userId=${userIdStr}&t=${timestamp}`;
    console.log(`[TemplateDetail] 调用积分接口：${fullUrl}`);
    
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      cache: 'no-cache',
      credentials: 'include'
    });
    
    if (!res.ok) {
      console.error(`积分接口请求失败，状态码：${res.status}`);
      return { success: false, msg: `接口请求失败（${res.status}）` };
    }
    
    const data = await res.json();
    console.log(`[TemplateDetail] 积分接口返回：`, data);
    return data;
  } catch (error) {
    console.error('[TemplateDetail] 积分接口请求失败:', error);
    return { success: false, msg: '网络错误，请重试' };
  }
};

const getCurrentUserId = (): number | null => {
  try {
    const savedUser = localStorage.getItem('ai_photo_generator_user');
    if (!savedUser) return null;
    const userData = JSON.parse(savedUser);
    return userData.id || userData.user_id || null;
  } catch (err) {
    console.error('解析用户ID失败:', err);
    return null;
  }
};

const fetchLatestProfile = async (userId: number): Promise<PointsProfile | null> => {
  const res = await requestPointsApi(userId, '/profile');
  if (res.success) {
    return res.data;
  } else {
    alert(res.msg || '获取最新积分失败');
    return null;
  }
};

const fetchUserImages = async (userId: number): Promise<UploadHistoryItem[]> => {
  try {
    if (!userId) return [];
    
    const res = await fetch(`${USER_IMAGES_API}?userId=${userId}&type=upload&limit=10`, {
      cache: 'no-cache',
      credentials: 'include'
    });
    
    const data = await res.json();
    console.log(`[TemplateDetail] 获取用户历史图片返回：`, data);
    
    if (data.code === 0 && Array.isArray(data.data)) {
      return data.data.map(item => ({
        id: item.timestamp.toString(),
        fileName: item.fileName || `上传图片_${new Date(item.timestamp).toLocaleDateString()}`,
        fileType: 'image/jpeg',
        fileSize: 0,
        base64Url: item.url,
        tosUrl: item.url,
        timestamp: new Date(item.timestamp).toISOString()
      }));
    } else {
      console.error('[TemplateDetail] 获取用户图片失败:', data.message);
      return [];
    }
  } catch (error) {
    console.error('[TemplateDetail] 获取用户图片接口请求失败:', error);
    return [];
  }
};

const deductCreditsApi = async (userId: number, num: number): Promise<boolean> => {
  const res = await requestPointsApi(userId, '/deduct-credits', {
    method: 'POST',
    body: JSON.stringify({ num })
  });
  if (res.success) {
    return true;
  } else {
    alert(res.msg || '扣减积分失败');
    return false;
  }
};

const deductRoseApi = async (userId: number): Promise<boolean> => {
  const res = await requestPointsApi(userId, '/deduct-rose', {
    method: 'POST',
    body: JSON.stringify({ num: 1 })
  });
  if (res.success) {
    return true;
  } else {
    alert(res.msg || '扣减玫瑰失败');
    return false;
  }
};

const TemplateDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const template = TEMPLATES.find(t => t.id === id);
  
  // ========== 基础状态声明（原有代码不变） ==========
  const [profile, setProfile] = useState<PointsProfile>({
    points: 0,
    credits: 0,
    crystalRoses: 0,
    isPlusMember: false,
    lastRoseClaimDate: '',
    lastCreditsClaimDate: ''
  });

  const [isPlus, setIsPlus] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generationStep, setGenerationStep] = useState<string>('准备生成');
  const [isCompleted, setIsCompleted] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<UploadHistoryItem | null>(null);

  // ========== 新增：大图预览相关状态（原有代码不变） ==========
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState<string>('');

  // ========== Ref声明（原有代码不变） ==========
  const isPlusRef = useRef(isPlus);
  const profileRef = useRef<PointsProfile>(profile);
  const progressRef = useRef(0);
  const setProgressRef = useRef<(value: React.SetStateAction<number>) => void>(() => {});
  
  const requestIdRef = useRef<string>('');
  const currentRequestInfo = useRef<{
    requestId: string;
    deductType: 'credits' | 'rose';
    deductNum: number;
  } | null>(null);
  const savedImageUrls = useRef<Set<string>>(new Set());
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { refreshPoints } = useContext(PointsRefreshContext);

  // ========== 同步ref和状态（原有代码不变） ==========
  useEffect(() => {
    isPlusRef.current = isPlus;
    profileRef.current = profile;
    setProgressRef.current = setProgress;
  }, [isPlus, profile, setProgress]);

  // ========== 新增：大图预览相关逻辑（原有代码不变） ==========
  const handleImageClick = useCallback((imageUrl: string) => {
    setCurrentPreviewImage(imageUrl);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeImageModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentPreviewImage('');
    document.body.style.overflow = 'auto';
  }, []);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isModalOpen, closeImageModal]);

  useEffect(() => {
    const initProfileAndImages = async () => {
      const userId = getCurrentUserId();
      if (userId) {
        const latestProfile = await fetchLatestProfile(userId);
        if (latestProfile) {
          setProfile(latestProfile);
          profileRef.current = latestProfile;
        }

        const serverHistory = await fetchUserImages(userId);
        const localHistoryStr = localStorage.getItem('ai-upload-history');
        const localHistory: UploadHistoryItem[] = localHistoryStr ? JSON.parse(localHistoryStr) : [];

        const combinedHistory = [...serverHistory, ...localHistory].filter(
          (item, index, self) => index === self.findIndex(t => t.tosUrl === item.tosUrl)
        );

        const sortedHistory = combinedHistory
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);

        setUploadHistory(sortedHistory);
        localStorage.setItem('ai-upload-history', JSON.stringify(sortedHistory));
      } else {
        const localHistoryStr = localStorage.getItem('ai-upload-history');
        if (localHistoryStr) {
          setUploadHistory(JSON.parse(localHistoryStr));
        }
      }
    };

    initProfileAndImages();
    
    return () => {
      savedImageUrls.current.clear();
      currentRequestInfo.current = null;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!template) {
    return <div className="p-20 text-center font-bold text-gray-500 italic">模版未找到...</div>;
  }

  const addDebugLog = useCallback((msg: string) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
  }, []);

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

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }, []);

  const uploadImageToTOS = useCallback(async (base64Str: string, file: File) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('请先登录后再上传图片！');
      }

      setGenerationStep('正在上传图片到服务器...');
      addDebugLog(`开始上传图片（用户ID：${userId}）`);
      const res = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Str, userId })
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

  // ========== 修复Hook错误：重构callGenerateApi（原有代码不变） ==========
  const callGenerateApi = useCallback(async (tag: string, imageUrl: string): Promise<string> => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('请先登录后再生成图片！');
    }

    const requestId = `single_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    requestIdRef.current = requestId;
    
    const currentIsPlus = isPlusRef.current;
    const currentProfile = profileRef.current;
    currentRequestInfo.current = {
      requestId,
      deductType: currentIsPlus ? (currentProfile.crystalRoses > 0 ? 'rose' : 'credits') : 'credits',
      deductNum: currentIsPlus ? (currentProfile.crystalRoses > 0 ? 1 : 9) : 1
    };
    
    return new Promise((resolve, reject) => {
      let hasResolved = false;
      
      fetch(GENERATE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: tag, imageUrl, requestId, userId })
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
            if (!hasResolved) {
              hasResolved = true;
              resolve(data.data[0].url);
            }
          } else if (data.url) {
            if (!hasResolved) {
              hasResolved = true;
              resolve(data.url);
            }
          } else {
            reject(new Error('未找到图片URL'));
          }
        } catch (e) {
          const reader = response.body?.getReader();
          if (!reader) reject(new Error('无法获取响应流'));
          const decoder = new TextDecoder('utf-8');
          let resultImageUrl = '';

          const readStream = async () => {
            if (requestIdRef.current !== requestId) {
              reader.cancel(); 
              reject(new Error('请求已过期')); 
              return; 
            }
            
            const { done, value } = await reader.read();
            if (done) {
              if (resultImageUrl && !hasResolved) {
                hasResolved = true;
                resolve(resultImageUrl);
              } else {
                reject(new Error('流式解析未找到图片URL'));
              }
              return;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            chunk.split('\n').filter(line => line.trim()).forEach(line => {
              if (line.startsWith('data: ') && !hasResolved) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') return;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.url) {
                    resultImageUrl = data.url;
                    if (setProgressRef.current) {
                      setProgressRef.current(prev => Math.min(prev + 10, 100));
                    }
                    hasResolved = true;
                    resolve(resultImageUrl);
                  }
                } catch (err) { 
                  addDebugLog(`解析单行失败[${requestId}]：${(err as Error).message}`); 
                }
              }
            });
            
            if (!hasResolved) {
              readStream();
            }
          };
          
          readStream();
        }
      })
      .catch(err => reject(new Error(`生成失败：${(err as Error).message}`)));
    });
  }, [addDebugLog]);

  // ========== 修复重复保存：加强幂等性控制（原有代码不变） ==========
  const saveToGallery = useCallback((images: string[]) => {
    if (images.length === 0) return;
    
    const uniqueImages = Array.from(new Set(images)).filter(url => {
      const isNew = !savedImageUrls.current.has(url);
      if (isNew) savedImageUrls.current.add(url);
      return isNew;
    });
    
    if (uniqueImages.length === 0) {
      addDebugLog(`所有图片已保存过（内存），跳过保存`);
      return;
    }
    
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      templateId: template.id,
      templateTitle: template.title,
      images: uniqueImages,
      timestamp: new Date().toISOString(),
      isPlus: isPlusRef.current,
      originalImage: { tosUrl: uploadedImageUrl, source: selectedHistoryItem ? 'history' : 'upload' }
    };
    
    const saved: GalleryItem[] = JSON.parse(localStorage.getItem('ai-photo-gallery') || '[]');
    const urlExistsInLocal = uniqueImages.some(newUrl => 
      saved.some(savedItem => savedItem.images.includes(newUrl))
    );
    
    if (urlExistsInLocal) {
      addDebugLog(`图片已存在于本地图库，跳过保存`);
      return;
    }
    
    const updatedSaved = [newItem, ...saved];
    localStorage.setItem('ai-photo-gallery', JSON.stringify(updatedSaved));
    
    const userId = getCurrentUserId();
    if (userId) {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        saveGeneratedImageToServer(userId, newItem)
          .then(success => {
            if (success) {
              addDebugLog(`生成图片${newItem.id}已同步到后端，共${uniqueImages.length}张`);
            } else {
              addDebugLog(`生成图片${newItem.id}同步到后端失败`);
            }
          })
          .catch(err => {
            console.error('[TemplateDetail] 同步生成图片到后端失败:', err);
            addDebugLog(`生成图片${newItem.id}同步到后端异常：${(err as Error).message}`);
          });
      }, 1000);
    }
    
    addDebugLog(`生成成功！${uniqueImages.length}张图片已自动保存到图库`);
  }, [uploadedImageUrl, selectedHistoryItem, addDebugLog, template.id, template.title]);

  // ========== 核心逻辑：生成图片 + 错误处理（原有代码不变） ==========
  const startGeneration = useCallback(async () => {
    if (!uploadedImageUrl) { 
      alert('请先上传图片或选择历史图片！'); 
      return; 
    }
    if (isGenerating) { 
      alert('正在生成图片，请稍等！'); 
      return; 
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert('请先登录后再生成图片！');
      return;
    }

    const latestProfile = await fetchLatestProfile(userId);
    if (!latestProfile) return;
    const currentCredits = latestProfile.credits || 0;
    const currentRoses = latestProfile.crystalRoses || 0;
    const isPlusMember = latestProfile.isPlusMember || false;

    let deductSuccess = false;
    let deductMessage = '';
    let deductType: 'credits' | 'rose' = 'credits';
    let deductNum = 1;

    if (!isPlus) {
      if (currentCredits < 1) {
        alert(`积分不足！
生成单张需要1个积分点。
当前剩余：${currentCredits}个积分点
可点击顶部积分图标领取每日10个积分点，或完成任务获取更多。`);
        return;
      }
      deductSuccess = await deductCreditsApi(userId, 1);
      if (!deductSuccess) return;
      deductMessage = `已扣减1个积分点，剩余${currentCredits - 1}个`;
      deductType = 'credits';
      deductNum = 1;
    } else {
      if (currentRoses >= 1) {
        deductSuccess = await deductRoseApi(userId);
        if (!deductSuccess) return;
        deductMessage = `已使用1朵水晶玫瑰，剩余${currentRoses - 1}朵`;
        deductType = 'rose';
        deductNum = 1;
      } else {
        if (!isPlusMember) {
          alert(`无法生成九宫格！
当前水晶玫瑰：0朵 | PLUS会员：未开通
规则说明：
1. 1朵水晶玫瑰可免费生成1次九宫格
2. 开通PLUS会员后，可使用9个积分点生成九宫格
请先领取每日玫瑰或开通PLUS会员后重试。`);
          return;
        }
        if (currentCredits < 9) {
          alert(`积分不足！
PLUS会员生成九宫格需要9个积分点。
当前剩余：${currentCredits}个积分点
可点击顶部积分图标领取每日10个积分点，或完成任务获取更多。`);
          return;
        }
        deductSuccess = await deductCreditsApi(userId, 9);
        if (!deductSuccess) return;
        deductMessage = `已扣减9个积分点，剩余${currentCredits - 9}个`;
        deductType = 'credits';
        deductNum = 9;
      }
    }

    if (deductSuccess) {
      addDebugLog(deductMessage);
      const newProfile = await fetchLatestProfile(userId);
      if (newProfile) {
        setProfile(newProfile);
        profileRef.current = newProfile;
        try {
          await refreshPoints();
        } catch (e) {
          console.log('Context刷新失败，使用localStorage标记（仅存储，不触发事件）:', e);
          localStorage.setItem('ai_points_need_refresh', '1');
        }
      }
    }

    try {
      setIsGenerating(true);
      setIsCompleted(false);
      setProgress(0);
      progressRef.current = 0;
      setErrorMsg('');
      setGeneratedImages([]);
      setGenerationStep('AI正在绘制您的写真');

      const promptCode = `${isPlus ? 'G' : 'S'}${template.id}`;
      addDebugLog(`生成模式：${isPlus ? '九宫格' : '单张'}，提示词编号：${promptCode}`);
      const promptData = await getPromptByCode(promptCode);
      let actualGeneratedImages: string[] = [];

      if (!isPlus) {
        const generatedImageUrl = await callGenerateApi(promptData as string, uploadedImageUrl);
        actualGeneratedImages = [generatedImageUrl];
        setProgress(100);
        progressRef.current = 100;
      } else {
        const gridPrompts = promptData as string[];
        setGenerationStep('九宫格生成中（共9张）...');
        const generatePromises = [];
        for (let i = 0; i < gridPrompts.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 800));
          generatePromises.push(
            callGenerateApi(gridPrompts[i], uploadedImageUrl).catch(err => {
              addDebugLog(`九宫格第${i+1}张生成失败：${(err as Error).message}`);
              return '';
            })
          );
        }
        const results = await Promise.all(generatePromises);
        actualGeneratedImages = results.filter(url => url);
        setProgress(100);
        progressRef.current = 100;
        setGenerationStep(actualGeneratedImages.length < 9 
          ? `✅ 九宫格生成完成（${actualGeneratedImages.length}/9张成功）` 
          : '✅ 九宫格生成完成！'
        );
      }

      setGeneratedImages(actualGeneratedImages);
      setIsCompleted(true);
      setIsGenerating(false);
      saveToGallery(actualGeneratedImages);
      currentRequestInfo.current = null;

    } catch (err) {
      const errorMessage = (err as Error).message;
      setErrorMsg(errorMessage);
      setIsGenerating(false);
      setGenerationStep(`❌ 生成失败：${errorMessage}`);
      addDebugLog(`生成异常：${errorMessage}`);
      
      const requestInfo = currentRequestInfo.current;
      if (userId && requestInfo) {
        addDebugLog(`开始恢复扣减的资源：${requestInfo.deductType} ${requestInfo.deductNum}`);
        let restoreSuccess = false;
        
        if (requestInfo.deductType === 'credits') {
          restoreSuccess = await restoreCreditsApi(userId, requestInfo.deductNum, requestInfo.requestId);
        } else if (requestInfo.deductType === 'rose') {
          restoreSuccess = await restoreRoseApi(userId, requestInfo.requestId);
        }
        
        if (restoreSuccess) {
          const newProfile = await fetchLatestProfile(userId);
          if (newProfile) {
            setProfile(newProfile);
            profileRef.current = newProfile;
            await refreshPoints();
          }
          alert(`生成失败！已自动恢复扣减的${requestInfo.deductType === 'credits' ? '积分' : '玫瑰'}，错误信息：${errorMessage}`);
        } else {
          alert(`生成失败！错误信息：${errorMessage}
资源恢复接口暂未实现，已记录您的损失（userId:${userId}，requestId:${requestInfo.requestId}），
请联系客服并提供以上信息恢复扣减的${requestInfo.deductType === 'credits' ? '积分' : '玫瑰'}。`);
        }
      } else {
        alert(`生成失败！请联系客服恢复扣减的资源，错误信息：${errorMessage}`);
      }
      currentRequestInfo.current = null;
    }
  }, [
    uploadedImageUrl, isGenerating, isPlus, template.id, 
    getPromptByCode, callGenerateApi, saveToGallery, addDebugLog,
    refreshPoints, deductCreditsApi, deductRoseApi
  ]);

  const unlockPlus = () => {
    if (isGenerating) return;
    setIsUnlocking(true);
    setTimeout(() => {
      setIsPlus(true);
      isPlusRef.current = true;
      setProfile(prev => {
        const newProfile = { ...prev, isPlusMember: true };
        profileRef.current = newProfile;
        return newProfile;
      });
      addDebugLog('已解锁PLUS会员（前端），可使用九宫格积分生成模式');
      
      setIsUnlocking(false);
      setIsCompleted(false);
      setGeneratedImages([]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
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
          <div className="lg:col-span-7">
            {/* ========== 关键修正：移除行尾注释，使用类型断言后的组件 ========== */}
            {isPlus ? (
              <GridImageGeneratorWithClick 
                isGenerating={isGenerating}
                progress={progress}
                generationStep={generationStep}
                isCompleted={isCompleted}
                images={generatedImages}
                template={template}
                uploadedImageUrl={uploadedImageUrl}
                onImageClick={handleImageClick}
              />
            ) : (
              <SingleImageGeneratorWithClick 
                isGenerating={isGenerating}
                progress={progress}
                generationStep={generationStep}
                isCompleted={isCompleted}
                images={generatedImages}
                template={template}
                uploadedImageUrl={uploadedImageUrl}
                onImageClick={handleImageClick}
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

          <div className="lg:col-span-5 space-y-8">
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
                          {profile.crystalRoses > 0 ? '(消耗1玫瑰)' : '(PLUS会员消耗9积分点)'}
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

            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-gray-100/50 border border-gray-50">
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

              <div className="mt-10 space-y-4">
                <button 
                  onClick={startGeneration}
                  disabled={!uploadedImageUrl || isGenerating}
                  className={`w-full py-6 rounded-3xl text-lg font-black tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center space-x-3
                    ${isGenerating ? 'bg-gray-100 text-gray-400 cursor-wait' 
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

      {/* 大图预览模态框（原有代码不变） */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-all"
              aria-label="关闭大图预览"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={currentPreviewImage} 
              alt="大图预览" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}
      
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