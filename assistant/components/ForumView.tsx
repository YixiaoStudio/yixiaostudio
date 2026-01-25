
import React, { useState, useEffect } from 'react';
import { ForumPost } from '../types';

const INITIAL_POSTS: ForumPost[] = [
  { id: 'p1', title: '如何让 Midjourney 生成写实风格的人像？', author: '设计达人', content: '我尝试了很久，生成的总是带点动漫感，有大神分享一下 Prompt 技巧吗？', date: '2026-01-21', tag: '求助', repliesCount: 12, likes: 45 },
  { id: 'p2', title: 'DeepSeek 满血版真的比 Claude 3.5 强吗？', author: '测评君', content: '今天深度测试了一下两者的逻辑推理能力，结果出乎意料...', date: '2026-01-21', tag: '讨论', repliesCount: 89, likes: 230 },
  { id: 'p3', title: '分享一个 Typeless 的极速工作流设置', author: '效率控', content: '配合 Raycast 使用简直无敌，详细教程看二楼。', date: '2026-01-21', tag: '分享', repliesCount: 5, likes: 12 },
];

const ForumView: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTag, setActiveTag] = useState<'全部' | '求助' | '分享' | '讨论'>('全部');
  const [newPost, setNewPost] = useState({ title: '', content: '', tag: '求助' as const });

  useEffect(() => {
    const savedPosts = localStorage.getItem('yixiao_forum_posts');
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(INITIAL_POSTS);
    }
  }, []);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    const post: ForumPost = {
      id: `p-${Date.now()}`,
      title: newPost.title,
      content: newPost.content,
      author: '逸潇新用户',
      date: new Date().toLocaleDateString(),
      tag: newPost.tag,
      repliesCount: 0,
      likes: 0
    };
    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('yixiao_forum_posts', JSON.stringify(updatedPosts));
    setShowCreateModal(false);
    setNewPost({ title: '', content: '', tag: '求助' });
  };

  const filteredPosts = activeTag === '全部' ? posts : posts.filter(p => p.tag === activeTag);

  return (
    <div className="py-8 px-4 animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-2">用户论坛</h2>
          <p className="text-gray-500 font-medium">交流 AI 心得，获取社区帮助，共同成长。</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-red-500 text-white rounded-2xl font-bold flex items-center space-x-2 hover:bg-red-600 transition-all shadow-lg shadow-red-100 transform hover:-translate-y-1"
        >
          <span>🆘 发帖求助 / 交流</span>
        </button>
      </div>

      <div className="flex space-x-3 mb-8 overflow-x-auto pb-2">
        {['全部', '求助', '分享', '讨论'].map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag as any)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTag === tag ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPosts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                  post.tag === '求助' ? 'bg-red-50 text-red-500' : 
                  post.tag === '分享' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {post.tag}
                </span>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
              </div>
              <span className="text-xs text-gray-400 font-medium">{post.date}</span>
            </div>
            
            <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
              {post.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-gray-400">
                  <span className="text-xs font-bold">👤 {post.author}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <span className="flex items-center space-x-1 text-xs font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.repliesCount}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-xs font-bold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{post.likes}</span>
                  </span>
                </div>
              </div>
              <button className="text-xs font-black text-indigo-600 hover:text-indigo-800">查看详情 →</button>
            </div>
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-gray-900">发布新帖子</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">帖子标签</label>
                <div className="flex space-x-3">
                  {(['求助', '分享', '讨论'] as const).map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setNewPost({...newPost, tag})}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        newPost.tag === tag ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">标题</label>
                <input 
                  required 
                  type="text" 
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  placeholder="简洁明了地描述你的问题或想法" 
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">正文内容</label>
                <textarea 
                  required 
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  placeholder="详细说明你的背景、尝试过的操作或想要分享的干货..." 
                  className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-32 resize-none"
                />
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                立即发布
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumView;
