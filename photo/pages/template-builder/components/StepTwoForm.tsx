import React from 'react';
import { Category, Template } from '../../../types';

interface StepTwoFormProps {
  mode: 'single' | 'grid';
  coverImage: string | null;
  selectedTemplateIds: string[];
  userTemplates: Template[];
  title: string;
  setTitle: (val: string) => void;
  subtitle: string;
  setSubtitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  category: Exclude<Category, '全部'>;
  setCategory: (val: Exclude<Category, '全部'>) => void;
  tags: string[];
  tagInput: string;
  setTagInput: (val: string) => void;
  addTag: () => void;
  removeTag: (tag: string) => void;
  handlePublish: () => void;
  isPublishing: boolean;
  onBack: () => void;
  // 新增：描述显示/隐藏相关属性
  showDescription: boolean;
  toggleShowDescription: () => void;
  // 新增：图片点击查看大图的回调
  onImageClick: (url: string) => void;
}

const StepTwoForm: React.FC<StepTwoFormProps> = ({
  mode,
  coverImage,
  selectedTemplateIds,
  userTemplates,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  description,
  setDescription,
  category,
  setCategory,
  tags,
  tagInput,
  setTagInput,
  addTag,
  removeTag,
  handlePublish,
  isPublishing,
  onBack,
  showDescription,
  toggleShowDescription,
  onImageClick
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-6">
        <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-50">
          {mode === 'single' ? (
            <img 
              src={coverImage!} 
              className="w-full h-full object-cover cursor-pointer"  // 新增：添加鼠标指针样式
              alt="final preview" 
              onClick={() => coverImage && onImageClick(coverImage)}  // 新增：点击图片查看大图
            />
          ) : (
            <div className={`grid gap-1 h-full ${selectedTemplateIds.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {selectedTemplateIds.map(id => {
                const template = userTemplates.find(t => t.id === id);
                const imgUrl = template?.coverImage;
                return (
                  <img 
                    key={id} 
                    src={imgUrl} 
                    className="w-full h-full object-cover cursor-pointer"  // 新增：添加鼠标指针样式
                    alt="grid item" 
                    onClick={() => imgUrl && onImageClick(imgUrl)}  // 新增：点击宫格图片查看大图
                  />
                );
              })}
            </div>
          )}
        </div>
        <button 
          onClick={onBack}
          className="w-full py-3 text-gray-500 font-bold hover:text-indigo-600 transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>返回修改内容</span>
        </button>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-black text-gray-700">模版名称</label>
          <input 
            type="text" 
            placeholder={mode === 'grid' ? "例如：我的精选九宫格、春日写真集..." : "例如：赛博朋克霓虹、大唐盛世风..."}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-black text-gray-700">一句话介绍</label>
          <input 
            type="text" 
            placeholder="吸引用户点击的简短描述"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-black text-gray-700">分类选择</label>
          <div className="grid grid-cols-3 gap-3">
            {(['女神', '男神', '女孩', '男孩', '商家', '旅拍'] as Exclude<Category, '全部'>[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${category === cat ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-500 hover:border-indigo-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* 修改：标签提示从 3-5个 改为 至少1个 */}
          <label className="block text-sm font-black text-gray-700">风格标签 (至少1个)</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black">
                <span>{tag}</span>
                <button onClick={() => removeTag(tag)} className="hover:text-rose-500">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <input 
              type="text" 
              placeholder="输入标签按回车"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTag()}
              className="flex-grow px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all text-sm"
            />
            <button 
              onClick={addTag}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-black hover:bg-black transition-all"
            >
              添加
            </button>
          </div>
        </div>

        {/* 修改：添加描述显示/隐藏切换按钮，控制textarea显示 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-black text-gray-700">详细描述 (Prompt)</label>
            <button
              onClick={toggleShowDescription}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center space-x-1"
            >
              <svg className={`w-3 h-3 transition-transform ${showDescription ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{showDescription ? '隐藏' : '显示'}</span>
            </button>
          </div>
          
          {showDescription && (
            <textarea 
              rows={3}
              placeholder="详细描述模版的画面细节..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 focus:outline-none transition-all font-medium resize-none"
            />
          )}
        </div>

        <button 
          onClick={handlePublish}
          disabled={isPublishing}
          className={`
            w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all flex items-center justify-center space-x-3
            ${isPublishing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-[1.02] active:scale-95 shadow-indigo-200'}
          `}
        >
          {isPublishing ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在发布...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>确认发布模版</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepTwoForm;