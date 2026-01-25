
import React, { useState, useEffect } from 'react';
import { AITool } from '../types';

const getHandDrawnIcon = (slug: string) => `https://img.icons8.com/doodle/96/${slug}.png`;

const UserPoolView: React.FC = () => {
  const [userTools, setUserTools] = useState<AITool[]>([]);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    category: '效率办公',
    description: '',
    tutorial: '',
    icon: 'idea'
  });

  useEffect(() => {
    const savedTools = localStorage.getItem('yixiao_user_tools');
    const savedFavs = localStorage.getItem('yixiao_favorites');
    if (savedTools) setUserTools(JSON.parse(savedTools));
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTool: AITool = {
      id: `user-tool-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      icon: formData.icon,
      url: formData.url,
      isUserContributed: true,
      contributor: '逸潇用户',
      tutorialSteps: formData.tutorial.split('\n').filter(s => s.trim())
    };

    const updatedTools = [newTool, ...userTools];
    setUserTools(updatedTools);
    localStorage.setItem('yixiao_user_tools', JSON.stringify(updatedTools));
    setShowSubmitForm(false);
    setFormData({ name: '', url: '', category: '效率办公', description: '', tutorial: '', icon: 'idea' });
  };

  const toggleFavorite = (toolId: string) => {
    const newFavs = favorites.includes(toolId) 
      ? favorites.filter(id => id !== toolId)
      : [...favorites, toolId];
    setFavorites(newFavs);
    localStorage.setItem('yixiao_favorites', JSON.stringify(newFavs));
  };

  return (
    <div className="py-8 px-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">用户自建 AI 池</h2>
          <p className="text-gray-500 font-medium">人人都是贡献者。提交您发现的宝藏 AI，共享智慧。</p>
        </div>
        <button 
          onClick={() => setShowSubmitForm(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 transform hover:-translate-y-1"
        >
          <img src={getHandDrawnIcon('plus')} className="w-6 h-6 brightness-0 invert" alt="add" />
          <span>提交我的 AI 应用</span>
        </button>
      </div>

      {showSubmitForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 md:p-12 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900">发布 AI 应用</h3>
              <button onClick={() => setShowSubmitForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">应用名称</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="如: DeepCode AI" 
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">官方网址</label>
                  <input 
                    required 
                    type="url" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://..." 
                    className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">图标样式 (Slug)</label>
                <div className="flex items-center space-x-4">
                  <input 
                    required 
                    type="text" 
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="例如: robot, idea, rocket" 
                    className="flex-1 px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-dashed border-gray-200">
                    <img src={getHandDrawnIcon(formData.icon || 'idea')} className="w-full h-full object-contain" alt="preview" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">应用分类</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                >
                  <option>效率办公</option>
                  <option>创意设计</option>
                  <option>通用对话</option>
                  <option>代码编程</option>
                  <option>音视频</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">一句话描述</label>
                <textarea 
                  required 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="简单介绍一下它的核心功能..." 
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">简易教程 (每行一个步骤)</label>
                <textarea 
                  required 
                  value={formData.tutorial}
                  onChange={(e) => setFormData({...formData, tutorial: e.target.value})}
                  placeholder="第一步: 注册账号&#10;第二步: 选择模型&#10;第三步: 开始对话" 
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
                />
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                立即发布到广场
              </button>
            </form>
          </div>
        </div>
      )}

      {userTools.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-dashed border-gray-200 py-32 flex flex-col items-center justify-center text-center px-6">
          <img src={getHandDrawnIcon('island')} className="w-24 h-24 mb-6" alt="empty" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">自建池目前还是空的</h3>
          <p className="text-gray-500 max-w-md">期待您的第一个贡献！提交优秀的 AI 资源，帮助社区内的每一位用户。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userTools.map(tool => (
            <div key={tool.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all group p-8 relative flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-slate-50 w-20 h-20 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform p-3">
                  <img src={getHandDrawnIcon(tool.icon || 'idea')} className="w-full h-full object-contain" alt={tool.name} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-1 rounded uppercase tracking-tighter mb-2">
                    User Build
                  </span>
                  <button 
                    onClick={() => toggleFavorite(tool.id)}
                    className={`p-2 rounded-xl transition-all ${favorites.includes(tool.id) ? 'bg-amber-100 text-amber-500' : 'bg-gray-50 text-gray-300 hover:text-amber-400'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-sm text-gray-500 mb-6 flex-1 line-clamp-3 leading-relaxed">
                {tool.description}
              </p>

              <div className="mb-6 p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">简易教程摘要</p>
                <div className="space-y-2">
                  {tool.tutorialSteps?.slice(0, 2).map((step, i) => (
                    <div key={i} className="flex items-center text-xs text-slate-600 font-medium">
                      <span className="w-4 h-4 rounded-full bg-white border border-slate-200 text-[10px] flex items-center justify-center mr-2 font-bold">{i+1}</span>
                      {step}
                    </div>
                  ))}
                  {(tool.tutorialSteps?.length || 0) > 2 && <p className="text-[10px] text-indigo-500 font-bold ml-6">+ 更多步骤</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] overflow-hidden">
                      <img src={getHandDrawnIcon('user')} className="w-full h-full" alt="avatar" />
                    </div>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    <p className="font-bold text-gray-600">{tool.contributor}</p>
                    <p>分享于 刚刚</p>
                  </div>
                </div>
                <a 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-indigo-600 transition-all flex items-center space-x-2"
                >
                  <span>访问官网</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserPoolView;
