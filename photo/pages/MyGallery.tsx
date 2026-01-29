import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GalleryItem, CommunityPost, UserProfile } from '../types';
import { ALL_TASKS_CONFIG } from '../constants';

const MyGallery: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  // ========== 加载图库数据（保持不变） ==========
  useEffect(() => {
    let isMounted = true;
    try {
      const savedStr = localStorage.getItem('ai-photo-gallery');
      if (!savedStr) {
        isMounted && setItems([]);
        return;
      }
      
      const saved = JSON.parse(savedStr);
      if (Array.isArray(saved)) {
        const validItems = saved.filter(item => 
          item?.id && 
          item?.templateId && 
          item?.templateTitle && 
          Array.isArray(item?.images) && 
          item?.images.length > 0
        );
        if (isMounted) {
          setItems(validItems);
          if (validItems.length > 0) {
            console.log(`图库加载成功，共${validItems.length}个有效作品`);
          }
        }
      } else {
        isMounted && setItems([]);
        console.warn('图库数据格式错误，已重置为空');
      }
    } catch (err) {
      isMounted && setItems([]);
      console.error('读取图库数据失败：', err);
      localStorage.removeItem('ai-photo-gallery');
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // ========== 单张图片下载（无CORS限制） ==========
  const handleSingleDownload = (imageUrl: string, templateTitle: string, index: number) => {
    if (!imageUrl) {
      alert('图片URL无效，无法下载');
      return;
    }
    try {
      const a = document.createElement('a');
      a.href = imageUrl;
      const fileName = `${templateTitle}_${index + 1}_${new Date().getTime()}.jpg`;
      a.download = fileName;
      a.target = '_blank';
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      alert(`✅ 下载已触发！
若未自动下载，请右键图片选择「图片另存为」`);
    } catch (err) {
      console.error('单张图片下载失败：', err);
      alert('下载失败，请右键图片手动保存');
    }
  };

  // ========== 图片加载失败容错 ==========
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = 'https://via.placeholder.com/400x600?text=图片加载失败';
    console.warn(`图片加载失败：${e.currentTarget.src}`);
  };

  // ========== 分享功能（保持不变） ==========
  const earnPoints = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const taskKey = `ai-tasks-${today}`;
    const taskData = JSON.parse(localStorage.getItem(taskKey) || '{}');
    
    const config = ALL_TASKS_CONFIG.find(c => c.id === taskId);
    if (config && (taskData[taskId] || 0) < config.limit) {
      taskData[taskId] = (taskData[taskId] || 0) + 1;
      localStorage.setItem(taskKey, JSON.stringify(taskData));
      
      const user: UserProfile = JSON.parse(localStorage.getItem('ai-user-profile') || '{}');
      user.points = (user.points || 0) + config.points;
      localStorage.setItem('ai-user-profile', JSON.stringify(user));
      console.log(`完成任务: ${config.title}, 获得 ${config.points} 点数`);
    }
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('确定要从图库中永久删除这件作品吗？')) return;
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    localStorage.setItem('ai-photo-gallery', JSON.stringify(updated));
  };

  const shareToCommunity = (imageUrl: string) => {
    if (!selectedItem) return;
    setIsSharing(true);
    
    setTimeout(() => {
      const posts: CommunityPost[] = JSON.parse(localStorage.getItem('ai-community-posts') || '[]');
      const newPost: CommunityPost = {
        id: Date.now().toString(),
        userName: '我',
        userAvatar: 'https://i.pravatar.cc/150?u=me',
        imageUrl: imageUrl,
        title: `来看看我用【${selectedItem.templateTitle}】模版生成的写真！`,
        templateId: selectedItem.templateId,
        templateTitle: selectedItem.templateTitle,
        likes: 0,
        comments: [],
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('ai-community-posts', JSON.stringify([newPost, ...posts]));
      setIsSharing(false);
      earnPoints('share');
      alert('分享成功！获得贡献值奖励，已发布至社区。');
      navigate('/community');
    }, 1000);
  };

  const clearAll = () => {
    if (!window.confirm('确定要清空所有作品吗？此操作不可恢复。')) return;
    setItems([]);
    localStorage.removeItem('ai-photo-gallery');
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      <section className="bg-white border-b border-gray-100 pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black tracking-widest uppercase mb-4">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
              <span>Personal Collection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter">
              我的<span className="text-indigo-600">数字美术馆</span>
            </h1>
            <p className="mt-4 text-gray-400 font-medium max-w-lg">
              这里收藏了您每一次与 AI 协作产生的艺术结晶。所有作品均保存在本地浏览器中。
            </p>
          </div>
          {items.length > 0 && (
            <button 
              onClick={clearAll}
              className="text-xs font-black text-rose-400 hover:text-rose-600 transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>清空画廊</span>
            </button>
          )}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 mt-12">
        {items.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-[2rem] flex items-center justify-center text-gray-300 mb-6">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">画廊目前是空的</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto mb-8">您还没有创作过任何写真，快去浏览模版开启您的艺术之旅吧！</p>
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              去浏览模版
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {items.map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-50"
              >
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img 
                    src={item.images[0]} 
                    alt={item.templateTitle}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[8px] font-black rounded-full uppercase tracking-tighter">
                    {item.isPlus ? 'Premium Set' : 'Standard'}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                    <button 
                      onClick={(e) => deleteItem(item.id, e)}
                      className="absolute top-4 right-4 p-2 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <h4 className="text-white font-black text-lg truncate">{item.templateTitle}</h4>
                    <p className="text-white/60 text-[10px] font-medium">{new Date(item.timestamp).toLocaleDateString()} · {item.images.length}张照片</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 图片详情弹窗（简化版：仅保留分享+单张下载） */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl" onClick={() => setSelectedItem(null)} />
          <div className="relative w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-full">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
               <div>
                 <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedItem.templateTitle}</h2>
                 <p className="text-xs text-gray-400 font-medium">生成于 {new Date(selectedItem.timestamp).toLocaleString()}</p>
               </div>
               <button 
                onClick={() => setSelectedItem(null)}
                className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
               >
                 <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-8 bg-gray-50">
               <div className={`grid gap-4 ${selectedItem.isPlus ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1 max-w-md mx-auto'}`}>
                  {selectedItem.images.map((img, idx) => (
                    <div key={idx} className="aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border border-white group/img relative">
                      <img 
                        src={img} 
                        onError={handleImageError} 
                        className="w-full h-full object-cover" 
                        alt={`${selectedItem.templateTitle}-${idx+1}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-3 p-4 text-center">
                         {/* 分享按钮 */}
                         <button 
                           onClick={() => shareToCommunity(img)}
                           disabled={isSharing}
                           className="w-full py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] shadow-lg"
                         >
                           {isSharing ? '分享中...' : '分享到社区'}
                         </button>
                         {/* 核心：仅保留单张下载按钮 */}
                         <button 
                           onClick={() => handleSingleDownload(img, selectedItem.templateTitle, idx)}
                           className="w-full py-2 bg-white text-gray-900 rounded-xl font-black text-[10px] hover:bg-gray-100 transition-colors"
                         >
                           高清下载
                         </button>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default MyGallery;