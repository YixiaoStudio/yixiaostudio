
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommunityPost, Comment, Challenge, UserProfile } from '../types';
// Fix: Changed DAILY_TASKS_CONFIG to ALL_TASKS_CONFIG
import { ALL_TASKS_CONFIG } from '../constants';

const MOCK_AVATARS = [
  'https://i.pravatar.cc/150?u=1',
  'https://i.pravatar.cc/150?u=2',
  'https://i.pravatar.cc/150?u=3',
  'https://i.pravatar.cc/150?u=4',
];

const DAILY_CHALLENGE: Challenge = {
  id: 'chal-1',
  title: '冬日里的第一抹亮色',
  description: '使用任意“女神”或“男神”模版，并在生成时加入一张带有暖色的底图。',
  participants: 1248,
  bannerImage: 'https://images.unsplash.com/photo-1485199692108-c3b5069de6a0?auto=format&fit=crop&q=80&w=1200'
};

const Community: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [sortBy, setSortBy] = useState<'hot' | 'new'>('hot');
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState('');
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef<number>(0);

  useEffect(() => {
    const saved = localStorage.getItem('ai-community-posts');
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      const initial: CommunityPost[] = [
        {
          id: '1',
          userName: '极客少女',
          userAvatar: MOCK_AVATARS[0],
          imageUrl: 'https://picsum.photos/seed/post1/800/1000',
          title: '赛博朋克写真，真的太绝了！',
          templateId: 'goddess-ski',
          templateTitle: '赛博都市',
          likes: 1240,
          isLiked: false,
          comments: [{ id: 'c1', userName: '画师阿强', userAvatar: MOCK_AVATARS[1], content: '光影处理得太自然了。', timestamp: new Date().toISOString() }],
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          isChallengeEntry: true
        },
        {
          id: '2',
          userName: '时尚主编',
          userAvatar: MOCK_AVATARS[2],
          imageUrl: 'https://picsum.photos/seed/post2/800/1000',
          title: '极简白背景，怎么拍都高级',
          templateId: 'merchant-clothing',
          templateTitle: '极简商拍',
          likes: 856,
          isLiked: true,
          comments: [],
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      setPosts(initial);
      localStorage.setItem('ai-community-posts', JSON.stringify(initial));
    }
  }, []);

  const earnPoints = (taskId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const taskKey = `ai-tasks-${today}`;
    const taskData = JSON.parse(localStorage.getItem(taskKey) || '{}');
    
    // Fix: Changed DAILY_TASKS_CONFIG to ALL_TASKS_CONFIG
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

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      if (sortBy === 'hot') return b.likes - a.likes;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [posts, sortBy]);

  const topCreators = useMemo(() => {
    const creatorStats: Record<string, { name: string, avatar: string, totalLikes: number }> = {};
    posts.forEach(p => {
      if (!creatorStats[p.userName]) {
        creatorStats[p.userName] = { name: p.userName, avatar: p.userAvatar, totalLikes: 0 };
      }
      creatorStats[p.userName].totalLikes += p.likes;
    });
    return Object.values(creatorStats).sort((a, b) => b.totalLikes - a.totalLikes).slice(0, 5);
  }, [posts]);

  const handleLike = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = posts.map(p => {
      if (p.id === id) {
        if (!p.isLiked) earnPoints('like'); // 只有在点赞（非取消）时奖励
        return { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('ai-community-posts', JSON.stringify(updated));
    if (selectedPost?.id === id) {
       setSelectedPost(updated.find(p => p.id === id) || null);
    }
  };

  const handleImageDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (selectedPost && !selectedPost.isLiked) {
        handleLike(selectedPost.id);
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 800);
    }
    lastTapRef.current = now;
  };

  const toggleFollow = (userName: string) => {
    const next = new Set(followedUsers);
    if (next.has(userName)) next.delete(userName);
    else next.add(userName);
    setFollowedUsers(next);
  };

  const submitComment = () => {
    if (!commentText.trim() || !selectedPost) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      userName: '游客用户',
      userAvatar: 'https://i.pravatar.cc/150?u=me',
      content: commentText,
      timestamp: new Date().toISOString()
    };
    const updated = posts.map(p => {
      if (p.id === selectedPost.id) {
        return { ...p, comments: [newComment, ...p.comments] };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('ai-community-posts', JSON.stringify(updated));
    setSelectedPost(updated.find(p => p.id === selectedPost.id) || null);
    setCommentText('');
    earnPoints('comment'); // 奖励评论点数
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <div className="bg-white pt-24 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative h-48 md:h-64 rounded-[3rem] overflow-hidden group mb-12 shadow-2xl shadow-indigo-100">
             <img src={DAILY_CHALLENGE.bannerImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="challenge" />
             <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-8 md:p-12">
                <div className="inline-flex items-center space-x-2 bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full w-fit mb-4 animate-bounce">
                   <span>DAILY CHALLENGE</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white mb-2">{DAILY_CHALLENGE.title}</h2>
                <p className="text-white/70 text-sm max-w-md line-clamp-2 mb-6">{DAILY_CHALLENGE.description}</p>
                <div className="flex items-center space-x-4">
                   <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-xs font-black hover:bg-indigo-50 transition-all active:scale-95">立即参赛</button>
                   <span className="text-white/50 text-[10px] font-bold">{DAILY_CHALLENGE.participants} 位创作者已加入</span>
                </div>
             </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter">灵感<span className="text-indigo-600">社区</span></h1>
              <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
                <button onClick={() => setSortBy('hot')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${sortBy === 'hot' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>热度排行</button>
                <button onClick={() => setSortBy('new')} className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${sortBy === 'new' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}>最新发布</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col lg:flex-row gap-10">
        <div className="lg:w-3/4">
          <div className="columns-1 sm:columns-2 gap-6 space-y-6">
            {sortedPosts.map(post => (
              <div 
                key={post.id}
                onClick={() => setSelectedPost(post)}
                className="break-inside-avoid bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer border border-gray-100 group"
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} />
                  <div className="absolute top-4 left-4 flex items-center space-x-2 p-1 pr-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
                     <img src={post.userAvatar} className="w-6 h-6 rounded-full" alt="avatar" />
                     <span className="text-[10px] text-white font-black">{post.userName}</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                   <h3 className="text-sm font-black text-gray-900 line-clamp-2">{post.title}</h3>
                   <div className="flex items-center justify-between">
                      <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">@{post.templateTitle}</span>
                      <button 
                        onClick={(e) => handleLike(post.id, e)}
                        className={`flex items-center space-x-1.5 transition-colors ${post.isLiked ? 'text-rose-500' : 'text-gray-400'}`}
                      >
                        <svg className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-[10px] font-black">{post.likes}</span>
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:w-1/4 space-y-8">
           <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
                 <span>达人榜</span>
              </h3>
              <div className="space-y-6">
                 {topCreators.map((creator, i) => (
                   <div key={creator.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <img src={creator.avatar} className="w-8 h-8 rounded-full" alt="rank" />
                         <span className="text-xs font-black text-gray-800">{creator.name}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold">{creator.totalLikes} 赞</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-xl" onClick={() => setSelectedPost(null)} />
          <div className="relative w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]">
            <div 
              className="lg:w-3/5 bg-gray-100 flex items-center justify-center relative group cursor-pointer"
              onClick={handleImageDoubleTap}
            >
               <img src={selectedPost.imageUrl} className="max-h-full object-contain" alt="detail" />
               {showHeartAnim && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <svg className="w-40 h-40 text-rose-500 fill-current animate-heart-pop" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                 </div>
               )}
               <button 
                 onClick={() => navigate(`/template/${selectedPost.templateId}`)}
                 className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-white/90 backdrop-blur-md text-gray-900 rounded-2xl font-black text-sm shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all flex items-center space-x-2"
               >
                 <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                 <span>拍同款写真</span>
               </button>
            </div>
            
            <div className="lg:w-2/5 flex flex-col bg-white h-full overflow-hidden">
               <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center space-x-3">
                        <img src={selectedPost.userAvatar} className="w-10 h-10 rounded-full border-2 border-indigo-50" alt="avatar" />
                        <div>
                           <p className="text-sm font-black text-gray-900">{selectedPost.userName}</p>
                           <p className="text-[10px] text-gray-400">{new Date(selectedPost.timestamp).toLocaleDateString()}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => toggleFollow(selectedPost.userName)}
                       className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${followedUsers.has(selectedPost.userName) ? 'bg-gray-100 text-gray-400' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'}`}
                     >
                       {followedUsers.has(selectedPost.userName) ? '已关注' : '关注'}
                     </button>
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">{selectedPost.title}</h2>
                  <div className="flex items-center space-x-2">
                     <span className="text-[10px] font-black text-indigo-500 px-2 py-0.5 bg-indigo-50 rounded">模版: {selectedPost.templateTitle}</span>
                  </div>
               </div>

               <div className="flex-grow overflow-y-auto p-8 space-y-6">
                  {selectedPost.comments.length > 0 ? (
                    selectedPost.comments.map(c => (
                      <div key={c.id} className="flex space-x-3">
                         <img src={c.userAvatar} className="w-8 h-8 rounded-full" alt="avatar" />
                         <div className="space-y-1">
                            <p className="text-[11px] font-black text-gray-900">{c.userName}</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300">
                       <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                       <p className="text-xs font-bold">暂时没有评论，快来抢沙发</p>
                    </div>
                  )}
               </div>

               <div className="p-8 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <button 
                      onClick={(e) => handleLike(selectedPost.id, e)}
                      className={`flex items-center space-x-3 px-8 py-3 rounded-2xl transition-all active:scale-90 border-2 ${selectedPost.isLiked ? 'bg-rose-50 border-rose-100 text-rose-500 shadow-sm' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                      <svg className={`w-6 h-6 ${selectedPost.isLiked ? 'fill-current animate-heart-pop' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-sm font-black">{selectedPost.likes} {selectedPost.isLiked ? '已点赞' : '点赞'}</span>
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                     <input 
                       type="text" 
                       value={commentText} 
                       onChange={(e) => setCommentText(e.target.value)} 
                       placeholder="赞美是最好的鼓励..." 
                       className="flex-grow px-5 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 transition-colors" 
                       onKeyPress={(e) => e.key === 'Enter' && submitComment()}
                     />
                     <button 
                       onClick={submitComment} 
                       className="px-6 py-3 bg-indigo-600 text-white font-black rounded-2xl text-sm shadow-lg shadow-indigo-100 active:scale-95 transition-all"
                     >
                       发布
                     </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes heart-pop {
          0% { transform: scale(0); opacity: 0; }
          40% { transform: scale(1.2); opacity: 1; }
          60% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-heart-pop { animation: heart-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
};

export default Community;
