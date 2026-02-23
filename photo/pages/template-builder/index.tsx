import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Template } from '../../types';
import Header from './components/Header';
import StepOneSingle from './components/StepOneSingle';
import StepOneGrid from './components/StepOneGrid';
import StepTwoForm from './components/StepTwoForm';

// ========== 复用你跑通的 userId 工具函数 ==========
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

const generateRequestId = (): string => {
  return `single_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const TemplateBuilder: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'single' | 'grid'>('single');
  const [step, setStep] = useState(1);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Exclude<Category, '全部'>>('女神');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  
  // 新增：控制描述显示/隐藏的状态
  const [showDescription, setShowDescription] = useState(true);
  
  const [userTemplates, setUserTemplates] = useState<Template[]>([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // 新增：大图预览相关状态
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  // ========== API 配置 ==========
  const VOLC_API_BASE = 'https://sd5j17d5mg7k3v1e7vu60.apigateway-cn-beijing.volceapi.com'; 
  const UPLOAD_API = VOLC_API_BASE + '/api/upload-to-tos';
  const GENERATE_API = VOLC_API_BASE + '/api/generate-image';

  const API_CONFIG = {
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ai-user-templates') || '[]');
    setUserTemplates(saved);
  }, []);

  const toggleTemplateSelection = (id: string) => {
    if (selectedTemplateIds.includes(id)) {
      setSelectedTemplateIds(selectedTemplateIds.filter(tid => tid !== id));
    } else {
      if (selectedTemplateIds.length >= 9) {
        alert('最多只能选择 9 张模版');
        return;
      }
      setSelectedTemplateIds([...selectedTemplateIds, id]);
    }
  };

  // 上传参考图
  const uploadReferenceImage = async (base64Str: string) => {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('请先登录后再上传图片！');
    }

    try {
      const response = await fetch(UPLOAD_API, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({ base64Str, userId }),
      });

      if (!response.ok) throw new Error(`上传失败：${response.status}`);
      const result = await response.json();
      
      if (result.code === 0) {
        return result.data.imageUrl;
      } else {
        throw new Error(`上传失败：${result.message}`);
      }
    } catch (error) {
      throw new Error(`图片上传失败：${(error as Error).message}`);
    }
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入文字描述以生成图片');
      return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
      alert('请先登录后再生成图片！');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    try {
      const requestId = generateRequestId();
      let imageUrl = '';

      if (referenceImage) {
        const base64Str = referenceImage.split(',')[1];
        imageUrl = await uploadReferenceImage(base64Str);
      }

      const response = await fetch(GENERATE_API, {
        method: 'POST',
        headers: API_CONFIG.headers,
        body: JSON.stringify({
          prompt: prompt,
          imageUrl: imageUrl,
          requestId: requestId,
          userId: userId
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP${response.status}：${errText}`);
      }

      const data = await response.json();
      if (data.code !== 0) {
        throw new Error(`后端错误：${data.message || '未知错误'}`);
      }

      let generatedImageUrl = '';
      if (data.data && data.data.length > 0) {
        generatedImageUrl = data.data[0].url;
      } else if (data.url) {
        generatedImageUrl = data.url;
      } else {
        throw new Error('未找到图片URL');
      }

      // 设置生成的图片URL
      setCoverImage(generatedImageUrl);
      // 移除了生成成功的弹窗 alert('图片生成成功！');

    } catch (error) {
      const msg = (error as Error).message;
      setErrorMsg(msg);
      alert(`生成失败：${msg}`);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  };

  // 新增：点击图片查看大图的处理函数
  const handleImageClick = (url: string) => {
    setPreviewImageUrl(url);
    setShowImagePreview(true);
  };

  // 新增：关闭大图预览的函数
  const closeImagePreview = () => {
    setShowImagePreview(false);
    setPreviewImageUrl('');
  };

  // 上传封面图
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 上传参考图（现在只在下方用）
  const handleRefImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    // 保留标签上限5个的规则
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  // 新增：切换描述显示/隐藏的函数
  const toggleShowDescription = () => {
    setShowDescription(!showDescription);
  };

  const handlePublish = () => {
    // 核心修改1：标签验证改为至少1个，描述仅在显示时验证
    const descriptionValid = !showDescription || (description && description.trim());
    if (!title || !subtitle || !descriptionValid || tags.length < 1) {
      const errorMsg = !title ? '请填写标题' :
                      !subtitle ? '请填写副标题' :
                      (showDescription && !description) ? '请填写详细描述' :
                      '请至少添加1个标签';
      alert(errorMsg);
      return;
    }

    if (mode === 'single' && !coverImage) {
      alert('请先生成或上传封面图');
      return;
    }

    if (mode === 'grid' && selectedTemplateIds.length !== 4 && selectedTemplateIds.length !== 9) {
      alert('请选择 4 张或 9 张模版制作宫格');
      return;
    }

    setIsPublishing(true);

    setTimeout(() => {
      let finalCover = coverImage;
      let finalExamples = [coverImage!];

      if (mode === 'grid') {
        const selected = userTemplates.filter(t => selectedTemplateIds.includes(t.id));
        finalCover = selected[0].coverImage;
        finalExamples = selected.map(t => t.coverImage);
      }

      const newTemplate: Template = {
        id: `user-${Date.now()}`,
        category,
        title,
        subtitle,
        description: showDescription ? description : '', // 隐藏时描述置空
        coverImage: finalCover!,
        exampleImages: finalExamples,
        tags,
        usageCount: 0,
        isNew: true
      };

      const existingTemplates = JSON.parse(localStorage.getItem('ai-user-templates') || '[]');
      localStorage.setItem('ai-user-templates', JSON.stringify([newTemplate, ...existingTemplates]));

      alert('模版发布成功！');
      navigate('/');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Header step={step} mode={mode} setMode={setMode} />

      {step === 1 ? (
        mode === 'single' ? (
          <StepOneSingle 
            coverImage={coverImage}
            isGenerating={isGenerating}
            prompt={prompt}
            setPrompt={setPrompt}
            handleGenerate={handleGenerate}
            handleImageUpload={handleImageUpload}
            referenceImage={referenceImage}
            handleRefImageUpload={handleRefImageUpload}
            refFileInputRef={refFileInputRef}
            fileInputRef={fileInputRef}
            // 核心修改2：进入发布步骤时，自动把prompt赋值给description
            onNext={() => {
              setDescription(prompt); // 自动填充描述为生成时的prompt
              setStep(2);
            }}
            // 传递点击图片查看大图的函数给 StepOneSingle
            onImageClick={handleImageClick}
          />
        ) : (
          <StepOneGrid 
            userTemplates={userTemplates}
            selectedTemplateIds={selectedTemplateIds}
            toggleTemplateSelection={toggleTemplateSelection}
            onNext={() => setStep(2)}
            setMode={setMode}
          />
        )
      ) : (
        <StepTwoForm 
          mode={mode}
          coverImage={coverImage}
          selectedTemplateIds={selectedTemplateIds}
          userTemplates={userTemplates}
          title={title}
          setTitle={setTitle}
          subtitle={subtitle}
          setSubtitle={setSubtitle}
          description={description}
          setDescription={setDescription}
          category={category}
          setCategory={setCategory}
          tags={tags}
          tagInput={tagInput}
          setTagInput={setTagInput}
          addTag={addTag}
          removeTag={removeTag}
          handlePublish={handlePublish}
          isPublishing={isPublishing}
          onBack={() => setStep(1)}
          // 传递描述显示/隐藏相关状态和函数
          showDescription={showDescription}
          toggleShowDescription={toggleShowDescription}
          // ========== 关键修复：添加 onImageClick 传递 ==========
          onImageClick={handleImageClick}
        />
      )}

      {/* 大图预览遮罩层 */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <button 
            className="absolute top-4 right-4 text-white text-2xl font-bold cursor-pointer z-10"
            onClick={closeImagePreview}
          >
            ×
          </button>
          <img 
            src={previewImageUrl} 
            alt="预览大图" 
            className="max-h-[90vh] max-w-[90vw] object-contain"
            // 阻止图片点击事件冒泡到遮罩层
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;